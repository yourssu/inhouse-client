import { useQueryClient } from '@tanstack/react-query';
import { Menu } from '@yourssu-inhouse/interior';
import { overlay } from 'overlay-kit';
import { MdEdit } from 'react-icons/md';
import { useLoading } from 'react-simplikit';

import { mailTemplateDetailOption } from '@/apis/mails/query';
import { TemplateEditorDialog } from '@/components/TemplateEditorDialog';

interface TemplateEditButtonProps {
  templateId: number;
}

export const TemplateEditButton = ({ templateId }: TemplateEditButtonProps) => {
  const queryClient = useQueryClient();
  const [loading, startLoading] = useLoading();

  const onClick = async () => {
    const detail = await startLoading(queryClient.fetchQuery(mailTemplateDetailOption(templateId)));
    overlay.openAsync<boolean>(({ close, isOpen }) => {
      return (
        <TemplateEditorDialog
          closeAsFalse={() => close(false)}
          closeAsTrue={() => close(true)}
          initialData={detail}
          isOpen={isOpen}
          mode="수정"
        />
      );
    });
  };

  return (
    <Menu.ButtonItem disabled={loading} icon={<MdEdit />} onClick={onClick}>
      수정하기
    </Menu.ButtonItem>
  );
};
