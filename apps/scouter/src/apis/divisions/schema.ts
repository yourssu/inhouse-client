import { z } from 'zod/v4';

export const DivisionNameSchema = z.enum(['운영', '개발', '디자인']);

export const DivisionResponseSchema = z.object({
  divisionId: z.number(),
  divisionName: DivisionNameSchema,
});

export type DivisionNameType = z.infer<typeof DivisionNameSchema>;
