import { z } from 'zod/v4';

import { InterviewRubricGroupNameSchema } from '@/apis/interviews/rubrics/schema';
import { interviewResultsKo } from '@/types/interviews';

const ScoreSchema = z
  .string()
  .regex(/^\d+$/, '점수를 입력해 주세요.')
  .transform(Number)
  .refine((score) => score >= 1, '점수는 1점 이상이어야 해요.');

const InterviewResultFormSchema = z
  .enum(interviewResultsKo)
  .optional()
  .pipe(z.enum(interviewResultsKo, { error: '평가 결과를 선택해 주세요.' }));

/**
 * 폼 전용 스키마
 *
 * `groupMaxScore`와 `title`은 저장 요청에 포함되지 않지만, 그룹별 배점 합을 검증하고
 * 오류 메시지에서 항목을 지목하기 위해 폼 값으로 들고 있어요.
 */
export const MyInterviewEvaluationFormSchema = z
  .object({
    groups: z.array(
      z.object({
        group: InterviewRubricGroupNameSchema,
        groupMaxScore: z.number(),
        items: z.array(
          z.object({
            itemId: z.number(),
            title: z.string(),
            maxScore: z.number(),
            score: ScoreSchema,
          }),
        ),
      }),
    ),
    overallComment: z.string(),
    result: InterviewResultFormSchema,
  })
  .superRefine(({ groups }, context) => {
    groups.forEach(({ groupMaxScore, items }, groupIndex) => {
      /**
       * 개별 필드 검증이 실패해도 이 검사는 실행되고, 그때는 변환 전 문자열이 그대로 넘어와요.
       * 문자열끼리 더해 엉뚱한 합계를 만들지 않도록 교차 검증을 건너뛰어요.
       */
      if (!items.every(({ score }) => Number.isFinite(score))) {
        return;
      }

      items.forEach(({ maxScore, score }, itemIndex) => {
        if (score <= maxScore) {
          return;
        }
        context.addIssue({
          code: 'custom',
          message: `배점(${maxScore}점)을 넘을 수 없어요.`,
          path: ['groups', groupIndex, 'items', itemIndex, 'score'],
        });
      });

      const scoreSum = items.reduce((sum, { score }) => sum + score, 0);

      if (scoreSum > groupMaxScore) {
        context.addIssue({
          code: 'custom',
          message: `점수 합(${scoreSum}점)이 배점(${groupMaxScore}점)을 넘었어요.`,
          path: ['groups', groupIndex, 'groupMaxScore'],
        });
      }
    });
  });

export type MyInterviewEvaluationForm = z.infer<typeof MyInterviewEvaluationFormSchema>;
export type MyInterviewEvaluationFormInput = z.input<typeof MyInterviewEvaluationFormSchema>;
