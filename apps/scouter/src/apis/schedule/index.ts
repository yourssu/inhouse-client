import { api } from '@/apis/api';
import {
  CreateScheduleCommandSchema,
  CreateScheduleRequestSchema,
  type CreateScheduleRequestType,
  DeleteSchedulesByPartResponseSchema,
  InterviewLocationSchema,
  type InterviewLocationType,
  InterviewScheduleSchema,
} from '@/apis/schedule/schema';

const locationTypeCommandMap = {
  동방: 'CLUB_ROOM',
  강의실: 'CLASS_ROOM',
  비대면: 'ONLINE',
  기타: 'ETC',
} as const;

const normalizeScheduleRequest = ({ locationDetail, ...schedule }: CreateScheduleRequestType) => ({
  ...schedule,
  ...(locationDetail == null ? {} : { locationDetail }),
});

export type GetSchedulesParams = {
  partId?: number;
};

type PatchInterviewLocationParams = InterviewLocationType & {
  scheduleId: number;
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
  const validated = CreateScheduleRequestSchema.array().parse(
    schedules.map(normalizeScheduleRequest),
  );
  await api.post('recruiter/schedule', { json: validated });
};

export const putInterviewSchedulesByPart = async (
  partId: number,
  schedules: CreateScheduleRequestType[],
) => {
  const validated = CreateScheduleCommandSchema.array().parse(
    schedules.map((schedule) => ({
      ...normalizeScheduleRequest(schedule),
      locationType: locationTypeCommandMap[schedule.locationType],
    })),
  );
  await api.put(`recruiter/schedule/part/${partId}`, { json: validated });
};

export const deleteInterviewSchedulesByPart = async (partId: number) => {
  const response = await api.delete(`recruiter/schedule/part/${partId}`).json();
  return DeleteSchedulesByPartResponseSchema.parse(response);
};

export const patchInterviewLocation = async ({
  scheduleId,
  locationType,
  locationDetail,
}: PatchInterviewLocationParams) => {
  const validated = InterviewLocationSchema.parse({
    locationType,
    ...(locationDetail == null ? {} : { locationDetail }),
  });
  await api.patch(`recruiter/schedule/${scheduleId}/location`, { json: validated });
};
