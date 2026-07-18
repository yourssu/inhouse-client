import { useQuery } from '@tanstack/react-query';
import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { Dialog, Select, TextField, useToast } from '@yourssu-inhouse/interior';
import { differenceInMinutes } from 'date-fns';
import { josa } from 'es-hangul';
import { assert } from 'es-toolkit';
import { useState } from 'react';
import { BiSolidCalendarCheck } from 'react-icons/bi';
import { MdPerson } from 'react-icons/md';

import type { InterviewScheduleType, LocationType } from '@/apis/schedule/schema';

import { patchInterviewLocation } from '@/apis/schedule';
import { interviewSchedulesOption, interviewSchedulesQueryKey } from '@/apis/schedule/query';
import { locationTypeNames } from '@/apis/schedule/schema';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { useToastedMutation } from '@/hooks/useToastedMutation';
import { findLocationConflict } from '@/routes/~_auth/~recruit/~schedules/utils/locationConflict';

interface LocationDialogContentProps {
  closeAsFalse: () => void;
  closeAsTrue: () => void;
  schedule: InterviewScheduleType;
}

export const LocationDialogContent = ({
  closeAsFalse,
  closeAsTrue,
  schedule,
}: LocationDialogContentProps) => {
  const [locationType, setLocationType] = useState<LocationType>(schedule.locationType);
  const [locationDetail, setLocationDetail] = useState(schedule.locationDetail ?? '');
  const toast = useToast();

  const { data: schedules = [], isLoading: isSchedulesLoading } = useQuery({
    ...interviewSchedulesOption(),
    staleTime: 1000 * 60 * 5,
  });
  const { invalidate: invalidateSchedules } = useQueryInvalidation(interviewSchedulesQueryKey);
  const { mutateWithToast, isPending } = useToastedMutation({
    mutationFn: patchInterviewLocation,
    successText: '장소를 변경했어요',
    onSettled: () => invalidateSchedules(),
  });

  const showLocationDetail =
    locationType === '비대면' || locationType === '강의실' || locationType === '기타';

  const handleSend = async () => {
    if (isSchedulesLoading) {
      toast.error('일정 정보를 아직 불러오지 못했어요. 잠시 후 다시 시도해 주세요');
      return;
    }

    const target = schedules.find(({ id }) => id === schedule.id);
    assert(target != null, `일정을 찾을 수 없어요: id(${schedule.id})`);

    if (findLocationConflict(schedules, target)) {
      toast.error(`이미 같은 시간에 ${josa(locationType, '을/를')} 사용하는 일정이 있어요`);
      return;
    }

    const trimmedDetail = locationDetail.trim();
    const { success } = await mutateWithToast({
      scheduleId: schedule.id,
      locationType,
      locationDetail: trimmedDetail === '' ? null : trimmedDetail,
    });
    if (success) {
      closeAsTrue();
    }
  };

  return (
    <>
      <Dialog.Content className="w-[350px] gap-4">
        <div className="bg-grey50 flex flex-col gap-2 rounded-xl px-4 pt-3 pb-3.5 text-sm">
          <div className="flex items-center gap-2">
            <MdPerson className="text-neutralDisabled size-6" />
            <span>{schedule.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <BiSolidCalendarCheck className="text-neutralDisabled size-6" />
            <span>
              {formatTemplates['1월 1일 (월) 23:00'](schedule.startTime)} ~{' '}
              {formatTemplates['23:00'](schedule.endTime)} (
              {differenceInMinutes(schedule.endTime, schedule.startTime)}분)
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Select
            items={locationTypeNames}
            label="장소"
            onValueChange={(value) => {
              setLocationType(value);
              setLocationDetail('');
            }}
            placeholder="장소를 선택하세요"
            size="lg"
            value={locationType || undefined}
            variant="outline"
          />
          {showLocationDetail && (
            <TextField
              label="세부 장소"
              onChange={(e) => setLocationDetail(e.target.value)}
              placeholder="세부 장소를 입력하세요"
              size="lg"
              value={locationDetail}
              variant="outline"
            />
          )}
        </div>
      </Dialog.Content>

      <Dialog.ButtonGroup>
        <Dialog.Button disabled={isPending} onClick={closeAsFalse} variant="secondary">
          취소
        </Dialog.Button>
        <Dialog.Button loading={isPending} onClick={handleSend} variant="primary">
          확인
        </Dialog.Button>
      </Dialog.ButtonGroup>
    </>
  );
};
