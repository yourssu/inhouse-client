// 임시 일정 (드래그로 생성 중인 일정)
export type DraftScheduleType = {
  applicantId: number;
  applicantName: string;
  endTime: Date;
  partId: number;
  startTime: Date;
};
