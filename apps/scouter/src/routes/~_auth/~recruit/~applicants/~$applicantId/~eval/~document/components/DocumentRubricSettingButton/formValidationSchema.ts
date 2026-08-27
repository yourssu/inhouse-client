import z from 'zod/v4';

/** 문항 배점의 합은 이 값과 같아야 저장할 수 있어요. */
export const DOCUMENT_RUBRIC_TOTAL_SCORE = 100;
export const DOCUMENT_RUBRIC_ITEM_MINIMUM_ERROR = '질문의 배점은 1점 이상이어야 해요.';

/**
 * 폼 전용 스키마
 *
 * 서버 요청에서는 배점이 숫자지만, 입력 단계에서는 문자열로 다뤄서 빈 값·비숫자 입력을
 * 정규식으로 구분하고, 값 자체는 1점 이상이어야 한다는 제약을 폼에서 바로 검증해요.
 */
export const UpdatePartDocumentsRubricsFormSchema = z.object({
  rubrics: z.array(
    z.object({
      sectionId: z.number(),
      maxScore: z
        .string()
        .regex(/^\d+$/, '배점을 입력해 주세요.')
        .transform(Number)
        .refine((score) => score >= 1, DOCUMENT_RUBRIC_ITEM_MINIMUM_ERROR),
      criterionDetail: z.string(),
    }),
  ),
});

export type UpdatePartDocumentsRubricsFormType = z.infer<
  typeof UpdatePartDocumentsRubricsFormSchema
>;
export type UpdatePartDocumentsRubricsFormInput = z.input<
  typeof UpdatePartDocumentsRubricsFormSchema
>;
