import { z } from 'zod/v4';

export const InterviewRequirementSchema = z.object({
  id: z.number().optional(),
  content: z.string(),
});

export const InterviewRequirementsSchema = z.object({
  culture: z.array(InterviewRequirementSchema),
  team: z.array(InterviewRequirementSchema),
  job: z.array(InterviewRequirementSchema),
  other: z.array(InterviewRequirementSchema),
});

export const GlobalInterviewRequirementsParamsSchema = z.object({
  semester: z.string().regex(/^\d{4}-[12]$/),
});

export const InterviewRequirementsParamsSchema = GlobalInterviewRequirementsParamsSchema.extend({
  partId: z.number(),
});

export type InterviewRequirement = z.infer<typeof InterviewRequirementSchema>;
export type InterviewRequirements = z.infer<typeof InterviewRequirementsSchema>;
export type GlobalInterviewRequirementsParams = z.infer<
  typeof GlobalInterviewRequirementsParamsSchema
>;
export type InterviewRequirementsParams = z.infer<typeof InterviewRequirementsParamsSchema>;
