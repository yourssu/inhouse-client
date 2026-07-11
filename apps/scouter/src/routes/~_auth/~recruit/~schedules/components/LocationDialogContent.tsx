import { Dialog, Select, TextField } from '@yourssu-inhouse/interior';
import { useState } from 'react';

const locationTypeOptions = ['동방', '강의실', '비대면', '기타'] as const;

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
  const [locationType, setLocationType] = useState('');
  const [locationDetail, setLocationDetail] = useState('');

  const handleSend = async () => {
    closeAsTrue();
  };

  return (
    <>
      <Dialog.Content className="w-[350px]">
        <Select
          items={locationTypeOptions}
          label="장소"
          onValueChange={(value) => {
            setLocationType(value);
            if (value === '동방') {
              setLocationDetail('');
            }
          }}
          placeholder="장소를 선택하세요"
          size="lg"
          value={locationType}
          variant="outline"
        />
        <TextField
          disabled={locationType === '동방'}
          label="세부 장소"
          onChange={(e) => setLocationDetail(e.target.value)}
          placeholder="세부 장소를 입력하세요"
          size="lg"
          value={locationDetail}
          variant="dimmed"
        />
      </Dialog.Content>

      <Dialog.ButtonGroup>
        <Dialog.Button onClick={closeAsFalse} variant="secondary">
          취소
        </Dialog.Button>
        <Dialog.Button
          disabled={!locationType.trim()}
          onClick={handleSend}
          variant="primary"
        >
          확인
        </Dialog.Button>
      </Dialog.ButtonGroup>
    </>
  );
};
