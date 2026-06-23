import { z } from 'zod/v4';

import { PartNameSchema } from '@/apis/parts/schema';

export const InterviewScheduleSchema = z.object({
  id: z.number(),
  name: z.string(),
  part: PartNameSchema,
  startTime: z.iso.datetime(),
  endTime: z.iso.datetime(),
});

export type InterviewScheduleType = z.infer<typeof InterviewScheduleSchema>;

// 일정 생성 요청 스키마
export const CreateScheduleRequestSchema = z.object({
  applicantId: z.number(),
  partId: z.number(),
  startTime: z.iso.datetime(),
  endTime: z.iso.datetime(),
});

export type CreateScheduleRequestType = z.infer<typeof CreateScheduleRequestSchema>;
