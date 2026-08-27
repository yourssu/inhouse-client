import { useSuspenseQuery } from '@tanstack/react-query';
import { Lottie } from '@toss/lottie';
import { Result, SegmentedControl } from '@yourssu-inhouse/interior';
import { lotties } from '@yourssu-inhouse/resources';
import { min, parseISO } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';

import { meOption } from '@/apis/members/query';
import { interviewSchedulesOption } from '@/apis/schedule/query';
import { ApplicantSelectionPanel } from '@/routes/~_auth/~recruit/~schedules/~new/components/ScheduleCreationView/ApplicantSelectionPanel';
import { DraggableWeeklyCalendar } from '@/routes/~_auth/~recruit/~schedules/~new/components/ScheduleCreationView/DraggableWeeklyCalendar';
import { useScheduleCreationContext } from '@/routes/~_auth/~recruit/~schedules/~new/context';
import { useScheduleApplicants } from '@/routes/~_auth/~recruit/~schedules/~new/hooks/useScheduleApplicants';
import { useSelectPart } from '@/routes/~_auth/~recruit/~schedules/~new/hooks/useSelectPart';
import {
  extractUniqueDates,
  getDateBounds,
  getNavigationDisabled,
} from '@/routes/~_auth/~recruit/~schedules/~new/utils/calendarNavigation';
import {
  scheduleAvailabilityFilter,
  useScheduleAnalytics,
} from '@/routes/~_auth/~recruit/~schedules/analytics';
import { CalendarPaper } from '@/routes/~_auth/~recruit/~schedules/components/CalendarPaper';

/*
  [정책 예외] 어드민 계정만 모든 파트의 면접 일정을 수정할 수 있어요.
  어드민 권한 출처가 API로 정리되기 전까지 하드코딩해요.
*/
const ADMIN_EMAIL = 'hrtest.urssu@gmail.com';

export const ScheduleCreationView = () => {
  const [displayDate, setDisplayDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'전체' | '희망'>('전체');
  const { semester, selectedPartId, activeApplicantId } = useScheduleCreationContext();
  const trackScheduleEvent = useScheduleAnalytics();

  const { parts, allApplicants, applicants, selectedPart } = useScheduleApplicants();
  const { data: existingSchedules = [] } = useSuspenseQuery({
    ...interviewSchedulesOption(),
    staleTime: 1000 * 60 * 10,
  });
  const { data: me } = useSuspenseQuery(meOption());

  const selectPartWith = useSelectPart({ allApplicants, existingSchedules });

  const showCalendar = selectedPartId !== null;

  const activeApplicant = useMemo(
    () => applicants.find((a) => a.applicantId === activeApplicantId),
    [applicants, activeApplicantId],
  );

  // 날짜 필터링 및 네비게이션은 유틸리티로 위임
  const filteredDates = useMemo(() => {
    if (viewMode !== '희망' || !activeApplicant) {
      return undefined;
    }
    return extractUniqueDates(activeApplicant);
  }, [viewMode, activeApplicant]);

  const { minDate, maxDate } = useMemo(() => getDateBounds(activeApplicant), [activeApplicant]);

  const { disablePrevious, disableNext } = useMemo(
    () => getNavigationDisabled(viewMode, displayDate, minDate, maxDate),
    [viewMode, displayDate, minDate, maxDate],
  );

  // 지원자 선택 시 첫 희망 일정의 주차로 이동
  const handleApplicantSelect = (applicant: (typeof applicants)[number]) => {
    if (applicant.availableTimes.length > 0) {
      const dates = applicant.availableTimes.map((time) => parseISO(time));
      setDisplayDate(min(dates));
    }
  };

  // 어드민은 모든 파트를 볼 수 있고, 그 외에는 본인 파트의 일정만 수정할 수 있어요.
  const isAdmin = me.email === ADMIN_EMAIL;

  // 본인 파트가 없으면(Head lead만 소속, HR 등) 일정을 만들 수 없어요.
  const myPart = useMemo(() => {
    const myPartName = me.parts.find((p) => p.part !== 'Head lead')?.part;
    return parts.find((p) => p.partName === myPartName);
  }, [me, parts]);

  const myPartApplicants = useMemo(
    () => allApplicants.filter((a) => a.part === myPart?.partName),
    [allApplicants, myPart],
  );

  useEffect(() => {
    if (selectedPartId !== null || myPart === undefined) {
      return;
    }
    if (!allApplicants.some((a) => a.part === myPart.partName)) {
      return;
    }
    selectPartWith(myPart, { onFirstApplicantSelected: handleApplicantSelect });
    // 마운트 후 한 번만 기본 선택을 적용한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPartId, myPart, allApplicants, selectPartWith]);

  const handleViewModeChange = (mode: '전체' | '희망') => {
    if (mode === viewMode) {
      return;
    }

    if (selectedPart !== undefined) {
      trackScheduleEvent('schedule_availability_filter_selected', {
        availability_filter: scheduleAvailabilityFilter[mode],
        part: selectedPart.partName,
        part_id: selectedPart.partId,
        selected_semester: semester,
      });
    }

    setViewMode(mode);
    if (mode === '희망' && minDate) {
      setDisplayDate(minDate);
    }
  };

  // 어드민은 전체 지원자, 그 외에는 본인 파트 지원자 기준으로 판단해요.
  if ((isAdmin ? allApplicants : myPartApplicants).length === 0) {
    return (
      <div className="flex h-full flex-[1_1_0] justify-center">
        <Result
          description="지원자가 생겨야 일정을 만들 수 있어요."
          figure={<Lottie className="size-13" delay={0.2} json={lotties.empty} />}
          title="아직 지원자가 없어요"
        />
      </div>
    );
  }

  return (
    <div className="flex w-full gap-6">
      <div>
        <div className="bg-background sticky top-[14px] flex w-[280px] shrink-0 flex-col gap-4">
          <ApplicantSelectionPanel
            allApplicants={allApplicants}
            applicants={applicants}
            existingSchedules={existingSchedules}
            fixedPart={isAdmin ? undefined : myPart}
            onApplicantSelect={handleApplicantSelect}
            parts={parts}
          />
        </div>
      </div>

      {!showCalendar && (
        <div className="flex h-full flex-[1_1_0] flex-col items-center justify-center">
          <Lottie autoPlay className="size-30" delay={100} json={lotties.leftArrow} />
          <div className="text-neutralMuted text-center text-lg font-medium whitespace-pre-wrap">
            {'먼저, 왼쪽 패널에서\n파트를 선택해주세요'}
          </div>
        </div>
      )}
      {showCalendar && (
        <CalendarPaper>
          <CalendarPaper.Header>
            <CalendarPaper.HeaderRow>
              <CalendarPaper.WeeklyIndicator
                date={displayDate}
                disableNext={disableNext}
                disablePrevious={disablePrevious}
                onDateChange={setDisplayDate}
              />
              <SegmentedControl
                id="calendar-view-mode"
                items={['전체', '희망']}
                onValueChange={handleViewModeChange}
                value={viewMode}
              />
            </CalendarPaper.HeaderRow>
          </CalendarPaper.Header>
          <CalendarPaper.Body>
            <DraggableWeeklyCalendar
              applicants={applicants}
              displayDate={displayDate}
              filteredDates={filteredDates}
            />
          </CalendarPaper.Body>
        </CalendarPaper>
      )}
    </div>
  );
};
