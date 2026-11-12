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

export const ReadDocumentCommentResponse = zod.object({
  commentId: zod.int(),
  sectionId: zod.int(),
  content: zod.string(),
  author: ReadDocumentCommentAuthorResponse,
  parentCommentId: zod.int().optional(),
  isEdited: zod.boolean(),
  createdAt: zod.iso.datetime({ offset: true }),
});

export type ReadDocumentCommentResponse = zod.input<typeof ReadDocumentCommentResponse>;
export type ReadDocumentCommentResponseOutput = zod.output<typeof ReadDocumentCommentResponse>;

export const CreateDocumentCommentRequest = zod.object({
  sectionId: zod.int(),
  content: zod.string().min(1),
  parentCommentId: zod.int().optional(),
});

export type CreateDocumentCommentRequest = zod.input<typeof CreateDocumentCommentRequest>;
export type CreateDocumentCommentRequestOutput = zod.output<typeof CreateDocumentCommentRequest>;

export const UpdateDocumentCommentRequest = zod.object({
  content: zod.string().min(1),
});

export type UpdateDocumentCommentRequest = zod.input<typeof UpdateDocumentCommentRequest>;
export type UpdateDocumentCommentRequestOutput = zod.output<typeof UpdateDocumentCommentRequest>;
/**
 * @summary 인라인 코멘트 조회
 */
export const GetDocumentsCommentsByApplicantIdParams = zod.object({
  applicantId: zod.int(),
});

export type GetDocumentsCommentsByApplicantIdParams = zod.input<
  typeof GetDocumentsCommentsByApplicantIdParams
>;
export type GetDocumentsCommentsByApplicantIdParamsOutput = zod.output<
  typeof GetDocumentsCommentsByApplicantIdParams
>;

/**
 * @summary 인라인 코멘트 작성
 */
export const PostDocumentsCommentsByApplicantIdParams = zod.object({
  applicantId: zod.int(),
});

export type PostDocumentsCommentsByApplicantIdParams = zod.input<
  typeof PostDocumentsCommentsByApplicantIdParams
>;
export type PostDocumentsCommentsByApplicantIdParamsOutput = zod.output<
  typeof PostDocumentsCommentsByApplicantIdParams
>;

/**
 * 본인이 작성한 코멘트만 삭제 가능합니다.
 * @summary 인라인 코멘트 삭제
 */
export const DeleteDocumentsCommentsByApplicantIdAndCommentIdParams = zod.object({
  applicantId: zod.int(),
  commentId: zod.int(),
});

export type DeleteDocumentsCommentsByApplicantIdAndCommentIdParams = zod.input<
  typeof DeleteDocumentsCommentsByApplicantIdAndCommentIdParams
>;
export type DeleteDocumentsCommentsByApplicantIdAndCommentIdParamsOutput = zod.output<
  typeof DeleteDocumentsCommentsByApplicantIdAndCommentIdParams
>;

/**
 * 본인이 작성한 코멘트만 수정 가능합니다.
 * @summary 인라인 코멘트 수정
 */
export const PatchDocumentsCommentsByApplicantIdAndCommentIdParams = zod.object({
  applicantId: zod.int(),
  commentId: zod.int(),
});

export type PatchDocumentsCommentsByApplicantIdAndCommentIdParams = zod.input<
  typeof PatchDocumentsCommentsByApplicantIdAndCommentIdParams
>;
export type PatchDocumentsCommentsByApplicantIdAndCommentIdParamsOutput = zod.output<
  typeof PatchDocumentsCommentsByApplicantIdAndCommentIdParams
>;
