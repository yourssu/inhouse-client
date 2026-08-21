import { useNavigate } from '@tanstack/react-router';
import { IconButton, Menu } from '@yourssu-inhouse/interior';
import { MdMoreVert } from 'react-icons/md';

import type { ApplicantStateType, ApplicantType } from '@/apis/applicants/schema';

import { useAlertDialog } from '@/hooks/useAlertDialog';
import { AssignmentEvalDialogContent } from '@/routes/~_auth/~recruit/~applicants/components/AssignmentEvalDialogContent';
import {
  isAssignmentEvalAccessAllowed,
  isInterviewEvalAccessAllowed,
  isQuestionnaireAccessAllowed,
} from '@/types/applicants';

interface ApplicantActionMenuProps {
  applicant: ApplicantType;
  hasAssignment: boolean;
}

const assignmentEvalGateErrorContent: Partial<Record<ApplicantStateType, string>> = {
  UNDER_REVIEW: '지원자에 대한 서류 합격/불합격 결정을 먼저 완료해 주세요.',
  INTERVIEW_REJECTED: '이미 다음 전형까지 진행된 지원자는 과제 평가를 다시 진행할 수 없어요.',
  INCUBATING_REJECTED: '이미 다음 전형까지 진행된 지원자는 과제 평가를 다시 진행할 수 없어요.',
  FINAL_ACCEPTED: '이미 다음 전형까지 진행된 지원자는 과제 평가를 다시 진행할 수 없어요.',
};

export const ApplicantActionMenu = ({ applicant, hasAssignment }: ApplicantActionMenuProps) => {
  const { applicantId, applicationSemester, name: applicantName, partId, state } = applicant;
  const navigate = useNavigate();
  const openAlertDialog = useAlertDialog();

  // 서류 불합이면 과제 평가 자체가 의미 없는 상태라 메뉴 항목을 아예 비활성화해요.
  // 그 외 차단 상태는 isAssignmentEvaluationAccessDisabled가 담당하고, 클릭 시 에러 모달로 안내해요.
  const isAssignmentEvaluationDisabled = state === 'DOCUMENT_REJECTED';
  const isAssignmentEvaluationAccessDisabled = !isAssignmentEvalAccessAllowed(state);
  const isInterviewEvaluationDisabled = !isInterviewEvalAccessAllowed(state);
  const isQuestionnaireDisabled = !isQuestionnaireAccessAllowed(state);

  const handleDocumentEvaluationClick = () => {
    navigate({
      params: { applicantId: String(applicantId) },
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
      to: '/recruit/applicants/$applicantId/eval/questionnaire',
    });
  };

  const handleAssignmentEvaluationClick = async () => {
    if (isAssignmentEvaluationAccessDisabled) {
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
          <Menu.ButtonItem
            className="disabled:cursor-not-allowed disabled:opacity-40"
            disabled={isAssignmentEvaluationDisabled}
            onClick={handleAssignmentEvaluationClick}
          >
            과제 평가
          </Menu.ButtonItem>
        )}
        <Menu.ButtonItem
          className="disabled:cursor-not-allowed disabled:opacity-40"
          disabled={isInterviewEvaluationDisabled}
          onClick={handleInterviewEvaluationClick}
        >
          면접 평가
        </Menu.ButtonItem>
        <Menu.ButtonItem
          className="disabled:cursor-not-allowed disabled:opacity-40"
          disabled={isQuestionnaireDisabled}
          onClick={handleQuestionnaireClick}
        >
          질문지 설계
        </Menu.ButtonItem>
      </Menu.Content>
    </Menu>
  );
};
