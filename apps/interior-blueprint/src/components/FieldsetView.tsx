import { Fieldset, Select, TextField } from '@yourssu-inhouse/interior';

export const FieldsetView = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">label 만</h3>
        <Fieldset label="이름">
          <TextField placeholder="홍길동" size="md" variant="outline" />
        </Fieldset>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">help 만</h3>
        <Fieldset help="영문으로 입력해 주세요">
          <TextField placeholder="honggildong" size="md" variant="outline" />
        </Fieldset>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">label + help</h3>
        <Fieldset help="@yourssu.com 도메인만 사용 가능해요" label="이메일">
          <TextField placeholder="email@yourssu.com" size="md" variant="outline" />
        </Fieldset>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">
          label/help 없음 (pass-through)
        </h3>
        <Fieldset>
          <TextField
            placeholder="label/help 가 없으면 children 만 렌더돼요"
            size="md"
            variant="outline"
          />
        </Fieldset>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">유즈케이스: 여러 필드 그룹핑</h3>
        <Fieldset help="필수 항목을 모두 입력해 주세요" label="연락처 정보">
          <div className="flex flex-col gap-3">
            <TextField placeholder="전화번호" size="md" variant="outline" />
            <Select
              items={['서울', '경기', '부산']}
              onValueChange={() => {}}
              placeholder="지역 선택"
              size="md"
              value="서울"
              variant="dimmed"
            />
          </div>
        </Fieldset>
      </div>
    </div>
  );
};
