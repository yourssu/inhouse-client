import { z } from 'zod/v4';

/** 루브릭 그룹은 Culture fit -> Team fit -> Job fit 순으로 노출해요. */
export const interviewRubricGroupNames = ['CULTURE_FIT', 'TEAM_FIT', 'JOB_FIT'] as const;

export const InterviewRubricGroupNameSchema = z.enum(interviewRubricGroupNames);

const ResponseScoreSchema = z.number().nullish();

export const InterviewRubricItemSchema = z.object({
  itemId: z.number(),
  title: z.string(),
  maxScore: ResponseScoreSchema,
});

export const InterviewRubricGroupSchema = z.object({
  group: InterviewRubricGroupNameSchema,
  groupMaxScore: ResponseScoreSchema,
  items: z.array(InterviewRubricItemSchema),
});

export const InterviewRubricSchema = z.object({
  id: z.number(),
  partId: z.number(),
  semester: z.string(),
  deadline: z.iso.datetime(),
  isLocked: z.boolean(),
  groups: z.array(InterviewRubricGroupSchema),
});

export const InterviewRubricParamsSchema = z.object({
  partId: z.number(),
  semester: z.string().regex(/^\d{4}-[12]$/),
});

export const UpdateInterviewRubricRequestSchema = z.object({
  deadline: z.iso.datetime(),
  groups: z
    .array(
      z.object({
        group: InterviewRubricGroupNameSchema,
        items: z.array(z.object({ itemId: z.number(), maxScore: z.number() })).min(1),
      }),
    )
    .min(1),
});

export type InterviewRubric = z.infer<typeof InterviewRubricSchema>;
export type InterviewRubricGroup = z.infer<typeof InterviewRubricGroupSchema>;
export type InterviewRubricGroupName = z.infer<typeof InterviewRubricGroupNameSchema>;
export type InterviewRubricParams = z.infer<typeof InterviewRubricParamsSchema>;
export type UpdateInterviewRubricRequest = z.infer<typeof UpdateInterviewRubricRequestSchema>;
