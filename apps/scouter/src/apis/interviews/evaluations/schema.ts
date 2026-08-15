import { z } from 'zod/v4';

export const interviewEvaluatorStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED'] as const;

export const InterviewEvaluatorStatusSchema = z.object({
  userId: z.number(),
  name: z.string(),
  status: z.enum(interviewEvaluatorStatuses),
});

export const InterviewEvaluatorStatusesSchema = z.array(InterviewEvaluatorStatusSchema);

export type InterviewEvaluatorStatus = z.infer<typeof InterviewEvaluatorStatusSchema>;
export type InterviewEvaluatorStatuses = z.infer<typeof InterviewEvaluatorStatusesSchema>;
