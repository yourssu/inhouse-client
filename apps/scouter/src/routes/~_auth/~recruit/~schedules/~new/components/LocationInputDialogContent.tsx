import { Dialog, Select, TextField } from '@yourssu-inhouse/interior';
import { useState } from 'react';
import { useLoading } from 'react-simplikit';

import type { LocationType } from '@/apis/schedule/schema';

import { locationTypeNames } from '@/apis/schedule/schema';

interface LocationInputDialogContentProps {
  closeAsFalse: () => void;
  closeAsTrue: () => void;
  onSubmit: (location: { locationDetail: null | string; locationType: LocationType }) => void;
}

export const LocationInputDialogContent = ({
  closeAsFalse,
  closeAsTrue,
  onSubmit,
}: LocationInputDialogContentProps) => {
  const [locationType, setLocationType] = useState<'' | LocationType>('');
  const [locationDetail, setLocationDetail] = useState('');
  const [isLoading, startLoading] = useLoading();

  const showLocationDetail =
    locationType === '비대면' || locationType === '강의실' || locationType === '기타';

  const isLocationTypeValid = locationType !== '';
  const isLocationDetailValid = !showLocationDetail || locationDetail.trim() !== '';
  const isFormValid = isLocationTypeValid && isLocationDetailValid;

  // TODO: 현재 확인 버튼은 로컬 draft 추가(동기)만 수행해요. 이후 같은 시간·같은 장소 중복 검사와
  // API 연동이 추가되면 loading이 실제 비동기 수명과 일치하게 돼요.
  const handleSubmit = async () => {
    if (!isFormValid) {
      return;
    }

    await startLoading(
      (async () => {
        onSubmit({
          locationType,
          locationDetail: showLocationDetail ? locationDetail.trim() : null,
        });
      })(),
    );
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
        <Dialog.Button disabled={isLoading} onClick={closeAsFalse} variant="secondary">
          취소
        </Dialog.Button>
        <Dialog.Button
          disabled={!isFormValid}
          loading={isLoading}
          onClick={handleSubmit}
          variant="primary"
        >
          확인
        </Dialog.Button>
      </Dialog.ButtonGroup>
    </>
  );
};
