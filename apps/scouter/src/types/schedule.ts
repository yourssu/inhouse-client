import type { LocationType } from '@/apis/schedule/schema';

// 임시 일정 (드래그로 생성 중인 일정)
export type DraftScheduleType = {
  applicantId: number;
  applicantName: string;
  endTime: Date;
  locationDetail: null | string;
  locationType: LocationType;
  partId: number;
  startTime: Date;
};
