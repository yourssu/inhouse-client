import { Menu } from '@yourssu-inhouse/interior';
import { MdDelete } from 'react-icons/md';
import { useLoading } from 'react-simplikit';

import { deleteMailReservationGroup } from '@/apis/mails';
import { mailsQueryKeys } from '@/apis/mails/query';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { useToastedMutation } from '@/hooks/useToastedMutation';

interface MailGroupCancelButtonProps {
  groupId: number;
}

export const MailGroupCancelButton = ({ groupId }: MailGroupCancelButtonProps) => {
  const [loading, startLoading] = useLoading();
  const openAlert = useAlertDialog();
  const { invalidate } = useQueryInvalidation(mailsQueryKeys.reservationGroups());

  const mutation = useToastedMutation({
    mutationFn: deleteMailReservationGroup,
    successText: '메일 예약을 취소했어요',
    onSuccess: () => {
      invalidate();
    },
  });

  const onClick = async () => {
    const isConfirm = await openAlert({
      title: '이 메일 예약을 취소할까요?',
      content: '그룹에 속한 모든 예약과 메일이 함께 삭제돼요.',
      primaryButtonText: '확인',
      secondaryButtonText: '취소',
    });

    if (isConfirm) {
      await startLoading(mutation.mutateWithToast(groupId));
    }
  };

  return (
    <Menu.ButtonItem disabled={loading} icon={<MdDelete />} onClick={onClick}>
      예약 취소하기
    </Menu.ButtonItem>
  );
};
