import { api } from '@/apis/api';
import {
  CreateScheduleRequestSchema,
  type CreateScheduleRequestType,
  InterviewLocationSchema,
  InterviewScheduleSchema,
} from '@/apis/schedule/schema';

export type GetSchedulesParams = {
  partId?: number;
};

export const getInterviewSchedules = async (params: GetSchedulesParams = {}) => {
  const response = await api
    .get('recruiter/schedule', {
      searchParams: params.partId ? { partId: params.partId } : {},
    })
    .json();
  return InterviewScheduleSchema.array().parse(response);
};

export const postInterviewSchedules = async (schedules: CreateScheduleRequestType[]) => {
  const validated = CreateScheduleRequestSchema.array().parse(schedules);
  await api.post('recruiter/schedule', { json: validated });
};

export const putInterviewSchedulesByPart = async (
  partId: number,
  schedules: CreateScheduleRequestType[],
) => {
  const validated = CreateScheduleRequestSchema.array().parse(schedules);
  await api.put(`recruiter/schedule/part/${partId}`, { json: validated });
};

export const deleteInterviewSchedulesByPart = async (partId: number) => {
  await api.delete(`recruiter/schedule/part/${partId}`);
};

export const patchInterviewLocation = async ({
  scheduleId,
  locationType,
  locationDetail = null,
}: {
  locationDetail?: null | string;
  locationType: string;
  scheduleId: number;
}) => {
  const validated = InterviewLocationSchema.parse({ locationType, locationDetail });
  await api.patch(`recruiter/schedule/${scheduleId}/location`, { json: validated });
};