import { z } from 'zod/v4';

export const PartNameSchema = z.enum([
  'Head lead',
  'Finance',
  'HR',
  'Marketing',
  'Legal',
  'PM',
  'Backend',
  'Android',
  'iOS',
  'Frontend',
  'Product Design',
]);

export const PartSchema = z.object({
  partId: z.number(),
  partName: PartNameSchema,
});

export type PartType = z.infer<typeof PartSchema>;
export type PartNameType = z.infer<typeof PartNameSchema>;
