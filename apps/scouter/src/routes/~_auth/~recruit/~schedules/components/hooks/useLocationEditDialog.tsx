import type { InterviewScheduleType } from '@/apis/schedule/schema';

import { useAlertDialog } from '@/hooks/useAlertDialog';
import {
  ScheduleAnalyticsContext,
  useScheduleAnalytics,
} from '@/routes/~_auth/~recruit/~schedules/analytics';
import { LocationDialogContent } from '@/routes/~_auth/~recruit/~schedules/components/LocationDialogContent';

export const useLocationEditDialog = (schedule: InterviewScheduleType) => {
  const openAlertDialog = useAlertDialog();
  const trackScheduleEvent = useScheduleAnalytics();

  return async () => {
    await openAlertDialog({
      title: '면접 장소 변경하기',
      content: ({ closeAsTrue, closeAsFalse }) => (
        <ScheduleAnalyticsContext.Provider value={trackScheduleEvent}>
          <LocationDialogContent
            closeAsFalse={closeAsFalse}
            closeAsTrue={closeAsTrue}
            schedule={schedule}
          />
        </ScheduleAnalyticsContext.Provider>
      ),
      customized: true,
    });
  };
};
