import { useNavigate } from '@tanstack/react-router';
import { IconButton, Menu } from '@yourssu-inhouse/interior';
import { MdMoreVert } from 'react-icons/md';

interface ApplicantActionMenuProps {
  applicantId: number;
  applicantName: string;
  partId: number;
}

export const ApplicantActionMenu = ({
  applicantId,
  applicantName,
  partId,
}: ApplicantActionMenuProps) => {
  const navigate = useNavigate();

  const handleDocumentEvaluationClick = () => {
    navigate({
      params: { applicantId: String(applicantId) },
      search: { partId },
      to: '/recruit/applicants/$applicantId/eval/document',
    });
  };

  const handleQuestionnaireClick = () => {
    navigate({
      params: { applicantId: String(applicantId) },
      to: '/recruit/applicants/$applicantId/interview/questionnaire',
    });
  };

  return (
    <Menu>
      <Menu.Trigger asChild>
        <IconButton
          aria-label={`${applicantName} 지원자 평가 메뉴 열기`}
          size="sm"
          variant="inline"
        >
          <MdMoreVert aria-hidden className="size-4.5" />
        </IconButton>
      </Menu.Trigger>
      <Menu.Content align="end" className="w-48">
        <Menu.ButtonItem onClick={handleDocumentEvaluationClick}>서류 평가</Menu.ButtonItem>
        <Menu.ButtonItem className="disabled:cursor-not-allowed disabled:opacity-40" disabled>
          면접 평가 · 준비 중
        </Menu.ButtonItem>
        <Menu.ButtonItem className="disabled:cursor-not-allowed disabled:opacity-40" disabled>
          과제 평가 · 준비 중
        </Menu.ButtonItem>
        <Menu.ButtonItem onClick={handleQuestionnaireClick}>질문지 설계</Menu.ButtonItem>
      </Menu.Content>
    </Menu>
  );
};
