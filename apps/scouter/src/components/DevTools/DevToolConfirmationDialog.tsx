import { Dialog } from '@yourssu-inhouse/interior';

import { useToastedMutation } from '@/hooks/useToastedMutation';

interface TargetDetail {
  label: string;
  value: string;
}

export interface DevToolConfirmationOptions {
  confirmText: string;
  description: string;
  mutationFn: () => Promise<void>;
  onSuccess?: () => Promise<unknown> | unknown;
  successText: string;
  targetDetails: TargetDetail[];
  title: string;
}

interface DevToolConfirmationDialogProps extends DevToolConfirmationOptions {
  close: (result: boolean) => void;
  isOpen: boolean;
}

export const DevToolConfirmationDialog = ({
  close,
  confirmText,
  description,
  isOpen,
  mutationFn,
  onSuccess,
  successText,
  targetDetails,
  title,
}: DevToolConfirmationDialogProps) => {
  const { isPending, mutateWithToast } = useToastedMutation({
    mutationFn,
    onSuccess: async () => {
      await onSuccess?.();
      close(true);
    },
    successText,
  });

  const closeAsFalse = () => {
    if (!isPending) {
      close(false);
    }
  };

  const handleConfirm = async () => {
    await mutateWithToast();
  };

  return (
    <Dialog closeableWithOutside={!isPending} onClose={closeAsFalse} open={isOpen}>
      <Dialog.Header onClickCloseButton={isPending ? undefined : closeAsFalse}>
        <Dialog.Title>{title}</Dialog.Title>
      </Dialog.Header>
      <Dialog.Content className="gap-4">
        <p className="text-neutralMuted leading-6">{description}</p>
        <dl className="border-greyOpacity200 bg-greyOpacity50 rounded-10 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border p-4 text-sm">
          {targetDetails.map(({ label, value }) => (
            <div className="contents" key={label}>
              <dt className="text-neutralSubtle font-medium">{label}</dt>
              <dd className="text-neutral min-w-0 font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-red600 text-sm font-medium">이 작업은 되돌릴 수 없어요.</p>
      </Dialog.Content>
      <Dialog.ButtonGroup>
        <Dialog.Button disabled={isPending} onClick={closeAsFalse} variant="secondary">
          취소
        </Dialog.Button>
        <Dialog.Button loading={isPending} onClick={handleConfirm} variant="danger">
          {confirmText}
        </Dialog.Button>
      </Dialog.ButtonGroup>
    </Dialog>
  );
};
