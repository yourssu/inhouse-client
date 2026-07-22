import { useQueryClient } from '@tanstack/react-query';
import { Menu } from '@yourssu-inhouse/interior';
import { MdDelete } from 'react-icons/md';
import { useLoading } from 'react-simplikit';

import { deleteMailReservationGroup } from '@/apis/mails';
import { mailReservationGroupsOption } from '@/apis/mails/query';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useToastedMutation } from '@/hooks/useToastedMutation';

interface MailReservationGroupDeleteButtonProps {
  reservationGroupId: number;
}

export const MailReservationGroupDeleteButton = ({
  reservationGroupId,
}: MailReservationGroupDeleteButtonProps) => {
  const queryClient = useQueryClient();

  const openAlert = useAlertDialog();

  const [loading, startLoading] = useLoading();

  const mutation = useToastedMutation({
    mutationFn: deleteMailReservationGroup,
    successText: '메일을 삭제했어요.',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mailReservationGroupsOption().queryKey });
    },
  });

  const onClick = async () => {
    const isConfirm = await openAlert({
      title: '이 메일을 삭제할까요?',
      content: '삭제된 메일은 복구할 수 없어요.',
      primaryButtonText: '확인',
      secondaryButtonText: '취소',
    });

    if (isConfirm) {
      await startLoading(mutation.mutateWithToast(reservationGroupId));
    }
  };

  return (
    <Menu.ButtonItem disabled={loading} icon={<MdDelete />} onClick={onClick}>
      삭제하기
    </Menu.ButtonItem>
  );
};
