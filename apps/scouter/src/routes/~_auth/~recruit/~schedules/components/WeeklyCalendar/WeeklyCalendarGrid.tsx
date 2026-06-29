import { differenceInMinutes, isSameDay, setHours, setMinutes, startOfDay } from 'date-fns';
import { assert } from 'es-toolkit';
import { useState } from 'react';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { InterviewScheduleType } from '@/apis/schedule/schema';

import { CurrentTimeIndicator } from '@/routes/~_auth/~recruit/~schedules/components/WeeklyCalendar/CurrentTimeIndicator';
import { WeeklyScheduleItem } from '@/routes/~_auth/~recruit/~schedules/components/WeeklyCalendar/WeeklyScheduleItem';
import { WeeklyCalendarLayout } from '@/routes/~_auth/~recruit/~schedules/components/WeeklyCalendarLayout';
import {
  hourHeight,
  startHour,
} from '@/routes/~_auth/~recruit/~schedules/components/WeeklyCalendarLayout/type';

interface WeeklyCalendarGridProps {
  applicants: ApplicantType[];
  displayDate: Date;
  schedules: InterviewScheduleType[];
}

interface OverlapInfo {
  column: number;
  totalColumns: number;
}

// 두 일정이 시간적으로 겹치는지 확인
const isOverlapping = (a: InterviewScheduleType, b: InterviewScheduleType): boolean => {
  return a.startTime < b.endTime && a.endTime > b.startTime;
};

// 겹치는 일정들의 레이아웃 정보를 계산
const calculateOverlapLayout = (schedules: InterviewScheduleType[]): Map<number, OverlapInfo> => {
  const overlapMap = new Map<number, OverlapInfo>();

  if (schedules.length === 0) {
    return overlapMap;
  }

  // 시작 시간순으로 정렬
  const sortedSchedules = [...schedules].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  // 각 일정에 대해 column 배정
  const columns: InterviewScheduleType[][] = [];

  for (const schedule of sortedSchedules) {
    let placed = false;

    // 기존 column 중 겹치지 않는 곳 찾기
    for (let i = 0; i < columns.length; i++) {
      const columnSchedules = columns[i];
      const hasOverlap = columnSchedules.some((s) => isOverlapping(s, schedule));

      if (!hasOverlap) {
        columns[i].push(schedule);
        overlapMap.set(schedule.id, { column: i, totalColumns: 0 }); // totalColumns는 나중에 계산
        placed = true;
        break;
      }
    }

    // 기존 column에 배치할 수 없으면 새 column 생성
    if (!placed) {
      columns.push([schedule]);
      overlapMap.set(schedule.id, { column: columns.length - 1, totalColumns: 0 });
    }
  }

  // 각 일정에 대해 실제로 겹치는 일정들의 totalColumns 계산
  for (const schedule of sortedSchedules) {
    const overlappingSchedules = sortedSchedules.filter(
      (s) => s.id !== schedule.id && isOverlapping(s, schedule),
    );

    // 현재 일정과 겹치는 모든 일정들의 column 값을 수집
    const usedColumns = new Set<number>();
    usedColumns.add(overlapMap.get(schedule.id)!.column);

    for (const overlap of overlappingSchedules) {
      usedColumns.add(overlapMap.get(overlap.id)!.column);
    }

    const info = overlapMap.get(schedule.id)!;
    info.totalColumns = Math.max(usedColumns.size, 1);
  }

  return overlapMap;
};

const OVERLAP_OFFSET = 30; // 겹칠 때 왼쪽으로부터의 오프셋 (px)

const WeeklyScheduleItemPosition = ({
  schedule,
  overlapInfo,
  children,
}: React.PropsWithChildren<{ overlapInfo?: OverlapInfo; schedule: InterviewScheduleType }>) => {
  const [isHovered, setIsHovered] = useState(false);
  const { startTime, endTime } = schedule;

  const startMinutes = differenceInMinutes(
    startTime,
    setMinutes(setHours(startOfDay(startTime), startHour), 0),
  );
  const durationMinutes = differenceInMinutes(endTime, startTime);

  const top = (startMinutes / 60) * hourHeight + 8; // 8: padding-top value
  const height = (durationMinutes / 60) * hourHeight;

  // 겹치는 일정 레이아웃 계산
  const column = overlapInfo?.column ?? 0;
  const totalColumns = overlapInfo?.totalColumns ?? 1;

  // 겹치는 일정이 있을 경우 오프셋 적용
  const left = totalColumns > 1 ? 2 + column * OVERLAP_OFFSET : 2;
  const right = totalColumns > 1 ? 2 + (totalColumns - 1 - column) * OVERLAP_OFFSET : 2;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        top: `${top}px`,
        height: `${height}px`,
        left: `${left}px`,
        right: `${right}px`,
        zIndex: isHovered ? 100 : column + 1,
      }}
    >
      {children}
    </div>
  );
};

export const WeeklyCalendarGrid = ({
  applicants,
  displayDate,
  schedules,
}: WeeklyCalendarGridProps) => {
  return (
    <div className="relative">
      <WeeklyCalendarLayout displayDate={displayDate}>
        <WeeklyCalendarLayout.Header />
        <WeeklyCalendarLayout.Body indicator={<CurrentTimeIndicator />}>
          {(date: Date) => {
            const daySchedules = schedules.filter(({ startTime }) => isSameDay(startTime, date));
            const overlapLayout = calculateOverlapLayout(daySchedules);

            return daySchedules.map((schedule) => {
              const applicant = applicants.find((applicant) => applicant.name === schedule.name);
              assert(!!applicant, `지원자를 찾을 수 없어요: ${schedule.name}`);
              return (
                <WeeklyScheduleItemPosition
                  key={schedule.id}
                  overlapInfo={overlapLayout.get(schedule.id)}
                  schedule={schedule}
                >
                  <WeeklyScheduleItem applicant={applicant} schedule={schedule} />
                </WeeklyScheduleItemPosition>
              );
            });
          }}
        </WeeklyCalendarLayout.Body>
      </WeeklyCalendarLayout>
    </div>
  );
};
