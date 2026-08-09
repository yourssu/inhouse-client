import { z } from 'zod/v4';

import { PartNameSchema } from '@/apis/parts/schema';

export const LocationTypeSchema = z.enum(['동방', '강의실', '비대면', '기타']);
export const locationTypeNames = LocationTypeSchema.options;

export type LocationType = z.infer<typeof LocationTypeSchema>;

export const InterviewScheduleSchema = z.object({
  id: z.number(),
  applicantId: z.number(),
  name: z.string(),
  part: PartNameSchema,
  startTime: z.iso.datetime(),
  endTime: z.iso.datetime(),
  locationType: LocationTypeSchema,
  locationDetail: z.string().nullish(),
});

export type InterviewScheduleType = z.infer<typeof InterviewScheduleSchema>;

export const CreateScheduleRequestSchema = z.object({
  applicantId: z.number(),
  partId: z.number(),
  startTime: z.iso.datetime(),
  endTime: z.iso.datetime(),
  locationType: LocationTypeSchema,
  locationDetail: z.string().optional(),
});

export const CreateScheduleInputSchema = CreateScheduleRequestSchema.extend({
  locationDetail: z.string().nullable(),
});

export type CreateScheduleRequestType = z.infer<typeof CreateScheduleInputSchema>;

export const ScheduleLocationCommandTypeSchema = z.enum([
  'CLUB_ROOM',
  'CLASS_ROOM',
  'ONLINE',
  'ETC',
]);

export const CreateScheduleCommandSchema = CreateScheduleRequestSchema.extend({
  locationType: ScheduleLocationCommandTypeSchema,
});

export const DeleteSchedulesByPartResponseSchema = z.object({
  deletedCount: z.number(),
});

export const InterviewLocationSchema = z.object({
  locationType: LocationTypeSchema,
  locationDetail: z.string().optional(),
});

export const InterviewLocationInputSchema = InterviewLocationSchema.extend({
  locationDetail: z.string().nullable(),
});

export type InterviewLocationType = z.infer<typeof InterviewLocationInputSchema>;
