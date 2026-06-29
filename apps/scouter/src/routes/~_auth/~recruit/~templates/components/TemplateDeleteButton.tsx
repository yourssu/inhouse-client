import { useQueryClient } from '@tanstack/react-query';
import { Menu } from '@yourssu-inhouse/interior';
import { MdDelete } from 'react-icons/md';
import { useLoading } from 'react-simplikit';

import { deleteMailTemplate } from '@/apis/mails';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useToastedMutation } from '@/hooks/useToastedMutation';

interface TemplateDeleteButtonProps {
  templateId: number;
}

export const TemplateDeleteButton = ({ templateId }: TemplateDeleteButtonProps) => {
  const queryClient = useQueryClient();
  const [loading, startLoading] = useLoading();
  const openAlert = useAlertDialog();

  const mutation = useToastedMutation({
    mutationFn: deleteMailTemplate,
    successText: '템플릿을 삭제했어요',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mails', 'templates'] });
    },
  });

  const onClick = async () => {
    const isConfirm = await openAlert({
      title: '이 템플릿을 삭제할까요?',
      content: '삭제된 템플릿은 복구할 수 없어요.',
      primaryButtonText: '확인',
      secondaryButtonText: '취소',
    });

    if (isConfirm) {
      await startLoading(mutation.mutateWithToast(templateId));
    }
  };

  return (
    <Menu.ButtonItem disabled={loading} icon={<MdDelete />} onClick={onClick}>
      삭제하기
    </Menu.ButtonItem>
  );
};
