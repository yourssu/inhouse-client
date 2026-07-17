import { z } from 'zod/v4';

import { PartNameSchema } from '@/apis/parts/schema';

export const LocationTypeSchema = z.enum(['동방', '강의실', '비대면', '기타']);
export const locationTypeNames = LocationTypeSchema.options;

export type LocationType = z.infer<typeof LocationTypeSchema>;

export const InterviewScheduleSchema = z.object({
  id: z.number(),
  name: z.string(),
  part: PartNameSchema,
  startTime: z.iso.datetime(),
  endTime: z.iso.datetime(),
  locationType: LocationTypeSchema,
  locationDetail: z.string().nullable(),
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

export const InterviewLocationSchema = z.object({
  locationType: LocationTypeSchema,
  locationDetail: z.string().nullable(),
});

export type InterviewLocationType = z.infer<typeof InterviewLocationSchema>;
