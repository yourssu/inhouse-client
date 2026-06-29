import z from 'zod/v4';

export const SemesterSchema = z.object({
  semesterId: z.number(),
  semester: z.string(),
});

export type SemesterType = z.infer<typeof SemesterSchema>;
