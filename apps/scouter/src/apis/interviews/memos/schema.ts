import {
  CreateInterviewCommentRequest,
  DeleteInterviewsCommentsByApplicantIdAndCommentIdParams,
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
export const DeleteInterviewMemoParamsSchema =
  DeleteInterviewsCommentsByApplicantIdAndCommentIdParams;

export type {
  CreateInterviewCommentRequest as CreateInterviewMemoRequestType,
  DeleteInterviewsCommentsByApplicantIdAndCommentIdParams as DeleteInterviewMemoParamsType,
  ReadDocumentCommentAuthorResponseOutput as InterviewMemoAuthorType,
  ReadInterviewCommentResponseOutput as InterviewMemoType,
  QuestionInterviewCommentsResponseOutput as QuestionInterviewMemosType,
} from './generated/schema.gen';

export type InterviewMemosType = QuestionInterviewCommentsResponseOutput[];
