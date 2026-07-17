import { useQuery } from '@tanstack/react-query';
import { Dialog, Select, TextField, useToast } from '@yourssu-inhouse/interior';
import { areIntervalsOverlapping } from 'date-fns';
import { useState } from 'react';

import type { LocationType } from '@/apis/schedule/schema';

import { patchInterviewLocation } from '@/apis/schedule';
import { interviewSchedulesOption, interviewSchedulesQueryKey } from '@/apis/schedule/query';
import { type InterviewScheduleType, locationTypeNames } from '@/apis/schedule/schema';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { useToastedMutation } from '@/hooks/useToastedMutation';

interface LocationDialogContentProps {
  closeAsFalse: () => void;
  closeAsTrue: () => void;
  scheduleId: number;
}

export const LocationDialogContent = ({
  closeAsFalse,
  closeAsTrue,
  scheduleId,
}: LocationDialogContentProps) => {
  const [locationType, setLocationType] = useState<'' | LocationType>('');
  const [locationDetail, setLocationDetail] = useState('');
  const toast = useToast();

  const { data: schedules = [] } = useQuery({
    ...interviewSchedulesOption(),
    staleTime: 1000 * 60 * 5,
  });
  const { invalidate: invalidateSchedules } = useQueryInvalidation(interviewSchedulesQueryKey);
  const { mutateWithToast, isPending } = useToastedMutation({
    mutationFn: patchInterviewLocation,
    successText: '장소를 변경했어요',
    onSettled: () => invalidateSchedules(),
  });

  const isClubRoomConflict = (target: InterviewScheduleType) => {
    const isTimingConflict = (a: InterviewScheduleType, b: InterviewScheduleType) =>
      areIntervalsOverlapping(
        { start: a.startTime, end: a.endTime },
        { start: b.startTime, end: b.endTime },
      );

    return schedules.some(
      (schedule) =>
        schedule.id !== scheduleId &&
        schedule.locationType === defaultLocationType &&
        isTimingConflict(schedule, target),
    );
  };

  const handleSend = async () => {
    if (locationType === '') {
      return;
    }

    if (locationType === defaultLocationType) {
      const target = schedules.find((schedule) => schedule.id === scheduleId);
      if (target === undefined) {
        toast.error('일정 정보를 아직 불러오지 못했어요. 잠시 후 다시 시도해 주세요');
        return;
      }
      if (isClubRoomConflict(target)) {
        toast.error(`같은 시간에 ${locationType}을 사용하는 일정이 이미 있어요`);
        return;
      }
    }

    const trimmedDetail = locationDetail.trim();
    const { success } = await mutateWithToast({
      scheduleId,
      locationType,
      locationDetail: trimmedDetail === '' ? null : trimmedDetail,
    });
    if (success) {
      closeAsTrue();
    }
  };

  return (
    <>
      <Dialog.Content className="w-[350px]">
        <Select
          items={locationTypeNames}
          label="장소"
          onValueChange={(value) => {
            setLocationType(value);
            if (value === defaultLocationType) {
              setLocationDetail('');
            }
          }}
          placeholder="장소를 선택하세요"
          size="lg"
          value={locationType || undefined}
          variant="outline"
        />
        <TextField
          disabled={locationType === defaultLocationType}
          label="세부 장소"
          onChange={(e) => setLocationDetail(e.target.value)}
          placeholder="세부 장소를 입력하세요"
          size="lg"
          value={locationDetail}
          variant="dimmed"
        />
      </Dialog.Content>

      <Dialog.ButtonGroup>
        <Dialog.Button disabled={isPending} onClick={closeAsFalse} variant="secondary">
          취소
        </Dialog.Button>
        <Dialog.Button
          disabled={locationType === ''}
          loading={isPending}
          onClick={handleSend}
          variant="primary"
        >
          확인
        </Dialog.Button>
      </Dialog.ButtonGroup>
    </>
  );
};

const defaultLocationType = '동방' satisfies LocationType;
