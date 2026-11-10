import {
  CreateInterviewCommentRequest,
  DeleteInterviewsMemosByApplicantIdAndCommentIdParams,
  QuestionInterviewCommentsResponse,
  type QuestionInterviewCommentsResponseOutput,
  ReadDocumentCommentAuthorResponse,
  ReadInterviewCommentResponse,
} from './generated/schema.gen';

export const InterviewMemoAuthorSchema = ReadDocumentCommentAuthorResponse;
export const InterviewMemoSchema = ReadInterviewCommentResponse;
export const QuestionInterviewMemosSchema = QuestionInterviewCommentsResponse;
export const InterviewMemosSchema = QuestionInterviewCommentsResponse.array();
export const CreateInterviewMemoRequestSchema = CreateInterviewCommentRequest;
export const DeleteInterviewMemoParamsSchema = DeleteInterviewsMemosByApplicantIdAndCommentIdParams;

export type {
  CreateInterviewCommentRequest as CreateInterviewMemoRequestType,
  DeleteInterviewsMemosByApplicantIdAndCommentIdParams as DeleteInterviewMemoParamsType,
  ReadDocumentCommentAuthorResponseOutput as InterviewMemoAuthorType,
  ReadInterviewCommentResponseOutput as InterviewMemoType,
  QuestionInterviewCommentsResponseOutput as QuestionInterviewMemosType,
} from './generated/schema.gen';

export type InterviewMemosType = QuestionInterviewCommentsResponseOutput[];
