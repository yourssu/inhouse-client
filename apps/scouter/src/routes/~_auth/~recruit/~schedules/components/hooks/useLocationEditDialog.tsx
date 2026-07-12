import { useAlertDialog } from '@/hooks/useAlertDialog';
import { LocationDialogContent } from '@/routes/~_auth/~recruit/~schedules/components/LocationDialogContent';

export const useLocationEditDialog = (scheduleId: number) => {
  const openAlertDialog = useAlertDialog();

  return async () => {
    await openAlertDialog({
      title: '면접 장소 변경하기',
      content: ({ closeAsTrue, closeAsFalse }) => (
        <LocationDialogContent
          closeAsFalse={closeAsFalse}
          closeAsTrue={closeAsTrue}
          scheduleId={scheduleId}
        />
      ),
      customized: true,
    });
  };
};
