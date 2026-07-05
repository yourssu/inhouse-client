import { Lottie } from '@toss/lottie';
import { SegmentedControl } from '@yourssu-inhouse/interior';
import { lotties } from '@yourssu-inhouse/resources';
import { min, parseISO } from 'date-fns';
import { useMemo, useState } from 'react';

import { ApplicantSelectionPanel } from '@/routes/~_auth/~recruit/~schedules/~new/components/ScheduleCreationView/ApplicantSelectionPanel';
import { DraggableWeeklyCalendar } from '@/routes/~_auth/~recruit/~schedules/~new/components/ScheduleCreationView/DraggableWeeklyCalendar';
import { useScheduleCreationContext } from '@/routes/~_auth/~recruit/~schedules/~new/context';
import { useScheduleApplicants } from '@/routes/~_auth/~recruit/~schedules/~new/hooks/useScheduleApplicants';
import {
  extractUniqueDates,
  getDateBounds,
  getNavigationDisabled,
} from '@/routes/~_auth/~recruit/~schedules/~new/utils/calendarNavigation';
import { CalendarPaper } from '@/routes/~_auth/~recruit/~schedules/components/CalendarPaper';

export const ScheduleCreationView = () => {
  const [displayDate, setDisplayDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'전체' | '희망'>('전체');
  const { selectedPartId, selectedSemesterId, activeApplicantId } = useScheduleCreationContext();

  const { parts, allApplicants, applicants } = useScheduleApplicants();

  const showCalendar = selectedSemesterId !== null && selectedPartId !== null;

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

  return (
    <div className="flex w-full gap-6">
      <div>
        <div className="bg-background sticky top-[14px] flex w-[280px] shrink-0 flex-col gap-4">
          <ApplicantSelectionPanel
            allApplicants={allApplicants}
            applicants={applicants}
            onApplicantSelect={handleApplicantSelect}
            parts={parts}
          />
        </div>
      </div>

      {!showCalendar && (
        <div className="flex h-full flex-[1_1_0] flex-col items-center justify-center">
          <Lottie autoPlay className="size-30" delay={100} json={lotties.leftArrow} />
          <div className="text-neutralMuted text-center text-lg font-medium whitespace-pre-wrap">
            {'먼저, 왼쪽 패널에서\n학기와 파트를 선택해주세요'}
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
                onValueChange={(mode) => {
                  setViewMode(mode);
                  if (mode === '희망' && minDate) {
                    setDisplayDate(minDate);
                  }
                }}
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
