import { useNavigate } from '@tanstack/react-router';
import { MdSend } from 'react-icons/md';

import { Menu } from '@/components/_ui/Menu';

interface TemplateUseButtonProps {
  templateId: number;
}

export const TemplateUseButton = ({ templateId }: TemplateUseButtonProps) => {
  const navigate = useNavigate();

  const onClick = () => {
    navigate({
      to: '/recruit/mail/new',
      search: {
        tid: templateId,
      },
    });
  };

  return (
    <Menu.ButtonItem icon={<MdSend />} onClick={onClick}>
      메일 작성하기
    </Menu.ButtonItem>
  );
};
