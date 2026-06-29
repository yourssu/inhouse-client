import { useNavigate } from '@tanstack/react-router';
import { Menu } from '@yourssu-inhouse/interior';
import { MdSend } from 'react-icons/md';

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
