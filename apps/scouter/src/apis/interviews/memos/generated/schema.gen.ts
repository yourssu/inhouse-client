/**
 * OpenAPI 명세에서 자동 생성된 파일입니다. 직접 수정하지 마세요.
 */
import * as zod from 'zod';

export const ReadDocumentCommentAuthorResponse = zod
  .object({
    userId: zod.int().describe('작성자 유저 ID'),
    nickname: zod.string().describe('작성자 닉네임 (영어 닉네임 또는 이름)'),
    part: zod.string().describe('작성자 파트명'),
  })
  .describe('코멘트 작성자 정보');

export type ReadDocumentCommentAuthorResponse = zod.input<typeof ReadDocumentCommentAuthorResponse>;
export type ReadDocumentCommentAuthorResponseOutput = zod.output<
  typeof ReadDocumentCommentAuthorResponse
>;

export const ReadInterviewCommentResponse = zod
  .object({
    commentId: zod.int().describe('코멘트 ID'),
    sectionId: zod.int().describe('할당된 면접 질문 ID (assignedQuestionId)'),
    content: zod.string().describe('면접 질문 코멘트 내용'),
    author: ReadDocumentCommentAuthorResponse.describe('작성자 정보'),
    createdAt: zod.iso.datetime({ offset: true }).describe('작성 일시'),
  })
  .describe('면접 질문 코멘트 항목 응답');

export type ReadInterviewCommentResponse = zod.input<typeof ReadInterviewCommentResponse>;
export type ReadInterviewCommentResponseOutput = zod.output<typeof ReadInterviewCommentResponse>;

export const QuestionInterviewCommentsResponse = zod
  .object({
    sectionId: zod.int().describe('할당된 면접 질문 ID (assignedQuestionId)'),
    comments: zod.array(ReadInterviewCommentResponse).describe('해당 질문에 작성된 코멘트 목록'),
  })
  .describe('질문 단위 면접 질문 코멘트 목록 응답');

export type QuestionInterviewCommentsResponse = zod.input<typeof QuestionInterviewCommentsResponse>;
export type QuestionInterviewCommentsResponseOutput = zod.output<
  typeof QuestionInterviewCommentsResponse
>;

export const CreateInterviewCommentRequest = zod
  .object({
    sectionId: zod.int().describe('할당된 면접 질문 ID (assignedQuestionId)'),
    content: zod.string().min(1).describe('면접 질문 코멘트 내용'),
  })
  .describe('면접 질문 코멘트 생성 요청');

export type CreateInterviewCommentRequest = zod.input<typeof CreateInterviewCommentRequest>;
export type CreateInterviewCommentRequestOutput = zod.output<typeof CreateInterviewCommentRequest>;
/**
 * 지원자의 할당된 질문별로 코멘트를 그룹화하여 조회합니다.
 * @summary 면접 질문 메모 목록 조회
 */
export const Read1Params = zod.object({
  applicantId: zod.int(),
});

export type Read1Params = zod.input<typeof Read1Params>;
export type Read1ParamsOutput = zod.output<typeof Read1Params>;

/**
 * @summary 면접 질문 메모 작성
 */
export const Create2Params = zod.object({
  applicantId: zod.int(),
});

export type Create2Params = zod.input<typeof Create2Params>;
export type Create2ParamsOutput = zod.output<typeof Create2Params>;

/**
 * 본인이 작성한 코멘트만 삭제 가능합니다.
 * @summary 면접 질문 코멘트 삭제
 */
export const DeleteById3Params = zod.object({
  applicantId: zod.int(),
  commentId: zod.int(),
});

export type DeleteById3Params = zod.input<typeof DeleteById3Params>;
export type DeleteById3ParamsOutput = zod.output<typeof DeleteById3Params>;
