import { Combobox } from '@yourssu-inhouse/interior';
import { useState } from 'react';

export const ComboboxView = () => {
  const [comboboxValue, setComboboxValue] = useState<string[]>([]);

  return (
    <>
      <div className="flex gap-4">
        <Combobox
          items={['김형수', '김민경', '박성욱', '이재원', '정재현']}
          onValueChange={setComboboxValue}
          placeholder="사람 선택"
          value={comboboxValue}
        />
      </div>
    </>
  );
};
