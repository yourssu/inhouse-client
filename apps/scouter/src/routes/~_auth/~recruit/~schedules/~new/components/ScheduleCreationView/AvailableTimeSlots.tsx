import clsx from 'clsx';
import { useMemo } from 'react';

import {
  type AvailableTimeRange,
  buildAvailabilityLookup,
  checkTimeAvailable,
} from '@/routes/~_auth/~recruit/~schedules/~new/utils/availableTime';
import {
  minutesToPixelHeight,
  minutesToPixelTop,
} from '@/routes/~_auth/~recruit/~schedules/~new/utils/dragPosition';
import { hours } from '@/routes/~_auth/~recruit/~schedules/components/WeeklyCalendarLayout/type';

interface AvailableTimeSlotsProps {
  availableTimeRanges: AvailableTimeRange[];
  date: Date;
  isDragging: boolean;
}

export const AvailableTimeSlots = ({
  date,
  availableTimeRanges,
  isDragging,
}: AvailableTimeSlotsProps) => {
  const availabilityLookup = useMemo(
    () => buildAvailabilityLookup(availableTimeRanges),
    [availableTimeRanges],
  );

  return (
    <>
      {hours.map((hour) => {
        const available0 = checkTimeAvailable(availabilityLookup, date, hour, 0);
        const available30 = checkTimeAvailable(availabilityLookup, date, hour, 30);

        if (!available0 && !available30) {
          return null;
        }

        return (
          <div key={hour}>
            {available0 && (
              <div
                className={clsx(
                  'bg-violet200 absolute right-0 left-0 opacity-50',
                  !isDragging && 'cursor-grab',
                  isDragging && 'cursor-grabbing',
                )}
                data-available-time={`${hour}:00`}
                style={{
                  top: minutesToPixelTop(hour * 60),
                  height: minutesToPixelHeight(30),
                }}
              />
            )}
            {available30 && (
              <div
                className={clsx(
                  'bg-violet200 absolute right-0 left-0 opacity-50',
                  !isDragging && 'cursor-grab',
                  isDragging && 'cursor-grabbing',
                )}
                data-available-time={`${hour}:30`}
                style={{
                  top: minutesToPixelTop(hour * 60 + 30),
                  height: minutesToPixelHeight(30),
                }}
              />
            )}
          </div>
        );
      })}
    </>
  );
};
