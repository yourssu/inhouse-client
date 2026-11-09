import {
  CreateInterviewCommentRequest,
  DeleteById3Params,
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
export const DeleteInterviewMemoParamsSchema = DeleteById3Params;

export type {
  CreateInterviewCommentRequest as CreateInterviewMemoRequestType,
  DeleteById3Params as DeleteInterviewMemoParamsType,
  ReadDocumentCommentAuthorResponseOutput as InterviewMemoAuthorType,
  ReadInterviewCommentResponseOutput as InterviewMemoType,
  QuestionInterviewCommentsResponseOutput as QuestionInterviewMemosType,
} from './generated/schema.gen';

export type InterviewMemosType = QuestionInterviewCommentsResponseOutput[];
