import { useNavigate } from '@tanstack/react-router';
import { IconButton, Menu } from '@yourssu-inhouse/interior';
import { MdMoreVert } from 'react-icons/md';

import type { ApplicantStateType, ApplicantType } from '@/apis/applicants/schema';

import { useAlertDialog } from '@/hooks/useAlertDialog';
import { AssignmentEvalDialogContent } from '@/routes/~_auth/~recruit/~applicants/components/AssignmentEvalDialogContent';

interface ApplicantActionMenuProps {
  applicant: ApplicantType;
  hasAssignment: boolean;
}

// 서류 결과가 합격이 아니면 과제 평가 모달 진입 시, 에러 모달로 안내해요.
const assignmentEvalGateErrorContent: Partial<Record<ApplicantStateType, string>> = {
  DOCUMENT_REJECTED: '서류가 불합격 처리된 지원자는 과제 평가를 진행할 수 없어요.',
  UNDER_REVIEW: '지원자에 대한 서류 합격/불합격 결정을 먼저 완료해 주세요.',
};

export const ApplicantActionMenu = ({ applicant, hasAssignment }: ApplicantActionMenuProps) => {
  const { applicantId, name: applicantName, partId, state } = applicant;
  const navigate = useNavigate();
  const openAlertDialog = useAlertDialog();

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

  const handleAssignmentEvaluationClick = async () => {
    const gateErrorContent = assignmentEvalGateErrorContent[state];
    if (gateErrorContent) {
      await openAlertDialog({
        content: gateErrorContent,
        primaryButtonText: '확인',
        title: `과제 평가 불가`,
      });
      return;
    }

    await openAlertDialog({
      content: ({ closeAsTrue }) => (
        <AssignmentEvalDialogContent
          applicantId={applicantId}
          applicantName={applicantName}
          closeAsTrue={closeAsTrue}
        />
      ),
      customized: true,
      title: `과제 평가`,
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
        {hasAssignment && (
          <Menu.ButtonItem onClick={handleAssignmentEvaluationClick}>과제 평가</Menu.ButtonItem>
        )}
        <Menu.ButtonItem className="disabled:cursor-not-allowed disabled:opacity-40" disabled>
          면접 평가 · 준비 중
        </Menu.ButtonItem>
        <Menu.ButtonItem onClick={handleQuestionnaireClick}>질문지 설계</Menu.ButtonItem>
      </Menu.Content>
    </Menu>
  );
};
