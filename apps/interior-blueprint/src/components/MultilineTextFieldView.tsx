import { MultilineTextField } from '@yourssu-inhouse/interior';
import { useState } from 'react';

export const MultilineTextFieldView = () => {
  const [value, setValue] = useState('제어되는 값\n두 번째 줄');

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">기본 (placeholder)</h3>
        <MultilineTextField placeholder="내용을 입력해 주세요" />
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">invalid (에러 상태)</h3>
        <MultilineTextField invalid placeholder="에러 메시지와 함께 표시돼요" />
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">disabled</h3>
        <MultilineTextField disabled placeholder="비활성화" value="편집할 수 없어요" />
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">controlled (value/onChange)</h3>
        <MultilineTextField onChange={(e) => setValue(e.target.value)} value={value} />
        <p className="text-13 text-greyOpacity500">현재 값: {value.replace(/\n/g, ' ⏎ ')}</p>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">
          withHeightAutoResize (입력에 맞춰 자동 확장)
        </h3>
        <MultilineTextField
          onChange={() => {}}
          placeholder="입력할수록 높이가 늘어나요 (줄바꿈 포함)"
          withHeightAutoResize
        />
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">유즈케이스: 코멘트 입력</h3>
        <MultilineTextField
          onChange={() => {}}
          placeholder="코멘트를 남겨 주세요..."
          withHeightAutoResize
        />
      </div>
    </div>
  );
};
