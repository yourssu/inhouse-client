import {
  createSchedules,
  deleteByPart,
  getSchedules as getGeneratedSchedules,
  updateByPart,
  updateLocation,
} from '@/apis/generated/schedule/client';
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
  const { data } = await getGeneratedSchedules(params);
  return InterviewScheduleSchema.array().parse(data);
};

export const postInterviewSchedules = async (schedules: CreateScheduleRequestType[]) => {
  const validated = CreateScheduleRequestSchema.array().parse(
    schedules.map(normalizeScheduleRequest),
  );
  await createSchedules(validated);
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
  await updateByPart(partId, validated);
};

export const deleteInterviewSchedulesByPart = async (partId: number) => {
  const { data } = await deleteByPart(partId);
  return DeleteSchedulesByPartResponseSchema.parse(data);
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
  await updateLocation(scheduleId, validated);
};
