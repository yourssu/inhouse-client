import { z } from 'zod/v4';

export const InterviewMemoAuthorSchema = z.object({
  nickname: z.string(),
  part: z.string(),
  userId: z.number(),
});

export const InterviewMemoSchema = z.object({
  author: InterviewMemoAuthorSchema,
  commentId: z.number(),
  content: z.string(),
  createdAt: z.iso.datetime(),
  sectionId: z.number(),
});

export const QuestionInterviewMemosSchema = z.object({
  comments: z.array(InterviewMemoSchema),
  sectionId: z.number(),
});

export const InterviewMemosSchema = z.array(QuestionInterviewMemosSchema);

export const CreateInterviewMemoRequestSchema = z.object({
  content: z.string().min(1),
  sectionId: z.number(),
});

export type InterviewMemoAuthorType = z.infer<typeof InterviewMemoAuthorSchema>;
export type InterviewMemoType = z.infer<typeof InterviewMemoSchema>;
export type QuestionInterviewMemosType = z.infer<typeof QuestionInterviewMemosSchema>;
export type InterviewMemosType = z.infer<typeof InterviewMemosSchema>;
export type CreateInterviewMemoRequestType = z.infer<typeof CreateInterviewMemoRequestSchema>;
