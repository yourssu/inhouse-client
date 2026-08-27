import { useNavigate } from '@tanstack/react-router';
import { Menu } from '@yourssu-inhouse/interior';
import { MdSend } from 'react-icons/md';

import { useTemplateAnalytics } from '@/routes/~_auth/~recruit/~templates/analytics';

interface TemplateUseButtonProps {
  templateId: number;
}

export const TemplateUseButton = ({ templateId }: TemplateUseButtonProps) => {
  const navigate = useNavigate();
  const trackTemplateEvent = useTemplateAnalytics();

  const onClick = () => {
    trackTemplateEvent('template_action_click', {
      template_action: 'compose_mail',
      template_id: templateId,
    });
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
