import z from 'zod/v4';

/** 문항 배점의 합은 이 값과 같아야 저장할 수 있어요. */
export const DOCUMENT_RUBRIC_TOTAL_SCORE = 100;

/**
 * 폼 전용 스키마
 *
 * 서버 요청에서는 배점이 숫자지만, 입력 단계에서는 문자열로 다뤄서 빈 값·비숫자 입력을
 * 정규식으로 구분하고, 값 자체는 1점 이상이어야 한다는 제약을 폼에서 바로 검증해요.
 * 문항별 배점의 합이 정확히 100점이어야 한다는 제약도 아래 `superRefine`에서 함께 검증해요.
 */
export const UpdatePartDocumentsRubricsFormSchema = z
  .object({
    rubrics: z.array(
      z.object({
        sectionId: z.number(),
        maxScore: z
          .string()
          .regex(/^\d+$/, '배점을 입력해 주세요.')
          .transform(Number)
          .refine((score) => score >= 1, '질문의 배점은 1점 이상이어야 해요.'),
        criterionDetail: z.string(),
      }),
    ),
  })
  .superRefine(({ rubrics }, context) => {
    /**
     * regex가 실패해도 뒤의 transform(Number)는 계속 실행돼서 여기엔 숫자로 넘어와요.
     * 다만 빈 문자열은 NaN이 아니라 0으로 바뀌어서 이 finite 체크만으론 못 걸러요.
     * 그래도 개별 필드 오류가 화면에서 항상 먼저 뜨니, 값이 이상해도 사용자에게는
     * 정상적인 문구가 보여요. 완전히 숫자가 아닌 값(NaN)일 때만 교차 검증을 건너뛰어요.
     */
    const scores = rubrics.map(({ maxScore }) => maxScore);

    if (!scores.every((score) => Number.isFinite(score))) {
      return;
    }

    const totalScore = scores.reduce((sum, score) => sum + score, 0);

    if (totalScore !== DOCUMENT_RUBRIC_TOTAL_SCORE) {
      context.addIssue({
        code: 'custom',
        message: '배점 합계가 100점일 때만 저장할 수 있습니다.',
        path: ['rubrics'],
      });
    }
  });

export type UpdatePartDocumentsRubricsFormType = z.infer<
  typeof UpdatePartDocumentsRubricsFormSchema
>;
export type UpdatePartDocumentsRubricsFormInput = z.input<
  typeof UpdatePartDocumentsRubricsFormSchema
>;
