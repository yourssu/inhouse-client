import type {
  InterviewEvaluatorStatuses,
  MyInterviewEvaluation,
} from '@/apis/interviews/evaluations/schema';

interface IsQuestionnaireLockedParams {
  evaluatorStatuses: InterviewEvaluatorStatuses;
  myEvaluation: MyInterviewEvaluation;
}

export const isQuestionnaireLocked = ({
  evaluatorStatuses,
  myEvaluation,
}: IsQuestionnaireLockedParams) =>
  myEvaluation.submittedAt != null ||
  evaluatorStatuses.some(({ status }) => status === 'SUBMITTED');
