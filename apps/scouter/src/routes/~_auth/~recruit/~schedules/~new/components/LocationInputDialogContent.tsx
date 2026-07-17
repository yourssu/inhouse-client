import { useQuery } from '@tanstack/react-query';
import { Dialog, Select, TextField, useToast } from '@yourssu-inhouse/interior';
import { useState } from 'react';

import type { PartNameType } from '@/apis/parts/schema';
import type { LocationType } from '@/apis/schedule/schema';

import { interviewSchedulesOption } from '@/apis/schedule/query';
import { locationTypeNames } from '@/apis/schedule/schema';
import { findLocationConflict } from '@/routes/~_auth/~recruit/~schedules/utils/locationConflict';

interface LocationInputDialogContentProps {
  closeAsFalse: () => void;
  closeAsTrue: () => void;
  endTime: Date;
  onSubmit: (location: { locationDetail: null | string; locationType: LocationType }) => void;
  selectedPartName: PartNameType;
  startTime: Date;
}

export const LocationInputDialogContent = ({
  closeAsFalse,
  closeAsTrue,
  onSubmit,
  endTime,
  startTime,
  selectedPartName,
}: LocationInputDialogContentProps) => {
  const toast = useToast();
  const [locationType, setLocationType] = useState<'' | LocationType>('');
  const [locationDetail, setLocationDetail] = useState('');

  const { data: schedules = [] } = useQuery({
    ...interviewSchedulesOption(),
    staleTime: 1000 * 60 * 5,
  });

  const showLocationDetail =
    locationType === '비대면' || locationType === '강의실' || locationType === '기타';

  const isLocationTypeValid = locationType !== '';
  const isLocationDetailValid = !showLocationDetail || locationDetail.trim() !== '';
  const isFormValid = isLocationTypeValid && isLocationDetailValid;

  const handleSubmit = async () => {
    if (!isFormValid) {
      return;
    }

    const schedule = {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      locationType,
      locationDetail: showLocationDetail ? locationDetail.trim() : null,
    };

    const otherPartSchedules = schedules.filter(({ part }) => part !== selectedPartName);
    const conflict = findLocationConflict(otherPartSchedules, schedule);
    if (conflict) {
      toast.error('이미 같은 시간에 같은 장소를 선택한 일정이 있어요');
      return;
    }

    onSubmit(schedule);
    closeAsTrue();
  };

  return (
    <>
      <Dialog.Content className="w-[350px]">
        <div className="flex flex-col gap-4 pb-1.5">
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
        <Dialog.Button onClick={closeAsFalse} variant="secondary">
          취소
        </Dialog.Button>
        <Dialog.Button disabled={!isFormValid} onClick={handleSubmit} variant="primary">
          확인
        </Dialog.Button>
      </Dialog.ButtonGroup>
    </>
  );
};
