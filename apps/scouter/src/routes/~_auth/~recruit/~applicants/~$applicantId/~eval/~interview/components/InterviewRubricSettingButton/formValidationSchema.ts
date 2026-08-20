import { z } from 'zod/v4';

import { InterviewRubricGroupNameSchema } from '@/apis/interviews/rubrics/schema';

/** 모든 fit 총점의 합은 이 값과 같아야 저장할 수 있어요. */
export const INTERVIEW_RUBRIC_TOTAL_SCORE = 100;

const FormScoreSchema = (emptyMessage: string, minimumMessage: string) =>
  z
    .string()
    .regex(/^\d+$/, emptyMessage)
    .transform(Number)
    .refine((score) => score >= 1, minimumMessage);

/**
 * 폼 전용 스키마
 *
 * `groupMaxScore`와 `title`은 저장 요청에 포함되지 않지만, 그룹별 배점 합을 검증하고
 * 오류 메시지에서 항목을 지목하기 위해 폼 값으로 들고 있어요.
 */
export const UpdateInterviewRubricFormSchema = z
  .object({
    groups: z.array(
      z.object({
        group: InterviewRubricGroupNameSchema,
        groupMaxScore: FormScoreSchema('총점을 입력해 주세요.', '총점은 1점 이상이어야 해요.'),
        items: z.array(
          z.object({
            itemId: z.number(),
            title: z.string(),
            maxScore: FormScoreSchema('배점을 입력해 주세요.', '배점은 1점 이상이어야 해요.'),
          }),
        ),
      }),
    ),
  })
  .superRefine(({ groups }, context) => {
    /**
     * 개별 필드 검증이 실패해도 이 검사는 실행되고, 그때는 변환 전 문자열이 그대로 넘어와요.
     * 문자열끼리 더해 엉뚱한 합계를 만들지 않도록 교차 검증을 건너뛰어요.
     */
    const scores = groups.flatMap(({ groupMaxScore, items }) => [
      groupMaxScore,
      ...items.map(({ maxScore }) => maxScore),
    ]);

    if (!scores.every((score) => Number.isFinite(score))) {
      return;
    }

    const mismatchedScoreGroups = groups
      .map(({ groupMaxScore, items }, groupIndex) => ({
        groupIndex,
        groupMaxScore,
        itemScoreSum: items.reduce((sum, { maxScore }) => sum + maxScore, 0),
      }))
      .filter(({ groupMaxScore, itemScoreSum }) => itemScoreSum !== groupMaxScore);

    mismatchedScoreGroups.forEach(({ groupIndex, groupMaxScore, itemScoreSum }) => {
      context.addIssue({
        code: 'custom',
        message: `항목 배점 합(${itemScoreSum}점)이 총점(${groupMaxScore}점)과 달라요.`,
        path: ['groups', groupIndex, 'groupMaxScore'],
      });
    });

    /**
     * 총합 오류는 `groups` 경로에 붙어서 그룹별 오류 배열을 덮어써요.
     * 그룹별 오류가 하나라도 있으면 그쪽을 먼저 보여주고, 총합 오류는 다음 검증에서 드러나게 해요.
     */
    if (mismatchedScoreGroups.length > 0) {
      return;
    }

    const groupScoreSum = groups.reduce((sum, { groupMaxScore }) => sum + groupMaxScore, 0);

    if (groupScoreSum !== INTERVIEW_RUBRIC_TOTAL_SCORE) {
      context.addIssue({
        code: 'custom',
        message: `모든 fit 총점의 합은 ${INTERVIEW_RUBRIC_TOTAL_SCORE}점이어야 해요. (현재 ${groupScoreSum}점)`,
        path: ['groups'],
      });
    }
  });

export type UpdateInterviewRubricForm = z.infer<typeof UpdateInterviewRubricFormSchema>;
export type UpdateInterviewRubricFormInput = z.input<typeof UpdateInterviewRubricFormSchema>;
