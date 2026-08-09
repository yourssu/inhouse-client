import z from 'zod/v4';

export const SemesterSchema = z.object({
  semesterId: z.number(),
  term: z.union([z.literal(1), z.literal(2)]),
  year: z.number(),
});

export type SemesterType = z.infer<typeof SemesterSchema>;
