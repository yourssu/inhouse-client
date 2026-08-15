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

// 이 상태일 때만 과제 평가 진입을 허용해요. 그 외 상태는 전부 에러 모달로 안내해요.
const assignmentEvalAllowedStates: readonly ApplicantStateType[] = [
  'ASSIGNMENT_ACCEPTED',
  'ASSIGNMENT_REJECTED',
  'DOCUMENT_ACCEPTED',
];

const assignmentEvalGateErrorContent: Partial<Record<ApplicantStateType, string>> = {
  UNDER_REVIEW: '지원자에 대한 서류 합격/불합격 결정을 먼저 완료해 주세요.',
  DOCUMENT_REJECTED: '서류가 불합격 처리된 지원자는 과제 평가를 진행할 수 없어요.',
  INTERVIEW_REJECTED: '이미 다음 전형까지 진행된 지원자는 과제 평가를 다시 진행할 수 없어요.',
  INCUBATING_REJECTED: '이미 다음 전형까지 진행된 지원자는 과제 평가를 다시 진행할 수 없어요.',
  FINAL_ACCEPTED: '이미 다음 전형까지 진행된 지원자는 과제 평가를 다시 진행할 수 없어요.',
};

export const ApplicantActionMenu = ({ applicant, hasAssignment }: ApplicantActionMenuProps) => {
  const { applicantId, applicationSemester, name: applicantName, partId, state } = applicant;
  const navigate = useNavigate();
  const openAlertDialog = useAlertDialog();

  const handleDocumentEvaluationClick = () => {
    navigate({
      params: { applicantId: String(applicantId) },
      search: { partId },
      to: '/recruit/applicants/$applicantId/eval/document',
    });
  };

  const handleInterviewEvaluationClick = () => {
    navigate({
      params: { applicantId: String(applicantId) },
      to: '/recruit/applicants/$applicantId/eval/interview',
    });
  };

  const handleQuestionnaireClick = () => {
    navigate({
      params: { applicantId: String(applicantId) },
      search: { partId, semester: applicationSemester },
      to: '/recruit/applicants/$applicantId/interview/questionnaire',
    });
  };

  const handleAssignmentEvaluationClick = async () => {
    if (!assignmentEvalAllowedStates.includes(state)) {
      await openAlertDialog({
        content:
          assignmentEvalGateErrorContent[state] ?? '지금 상태에서는 과제 평가를 진행할 수 없어요.',
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
        <Menu.ButtonItem onClick={handleInterviewEvaluationClick}>면접 평가</Menu.ButtonItem>
        <Menu.ButtonItem onClick={handleQuestionnaireClick}>질문지 설계</Menu.ButtonItem>
      </Menu.Content>
    </Menu>
  );
};
