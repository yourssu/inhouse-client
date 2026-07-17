import { areIntervalsOverlapping } from 'date-fns';

import type { InterviewScheduleType } from '@/apis/schedule/schema';

type BaseScheduleType = Pick<
  InterviewScheduleType,
  'endTime' | 'locationDetail' | 'locationType' | 'startTime'
>;

export const findLocationConflict = (schedules: BaseScheduleType[], target: BaseScheduleType) => {
  const isSameLocation = (a: BaseScheduleType, b: BaseScheduleType): boolean => {
    if (a.locationType !== b.locationType) {
      return false;
    }
    const aDetail = a.locationDetail?.trim() || null;
    const bDetail = b.locationDetail?.trim() || null;
    return aDetail === bDetail;
  };

  return schedules.find(
    (schedule) =>
      isSameLocation(schedule, target) &&
      areIntervalsOverlapping(
        { start: target.startTime, end: target.endTime },
        { start: schedule.startTime, end: schedule.endTime },
      ),
  );
};
