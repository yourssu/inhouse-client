# 날짜와 시간

## 적용 범위

날짜 스키마, 계산, 비교, 정렬, 현재 시간, 화면 포맷을 작성하거나 변경할 때 적용한다.

## 필수 규칙

- API의 ISO 날짜·시간 문자열은 Zod v4의 `z.iso.date()`, `z.iso.datetime()` 등 의도에 맞는 스키마로 검증한다.
- 네트워크·도메인 계층에서 표시용 문자열로 미리 포맷하지 않는다. 원본 ISO 문자열 또는 의미가 분명한 `Date`를 유지한다.
- timezone이 결과를 바꿀 수 있는 계산은 서버 값의 timezone 계약을 확인한다.

## 기본 선택

- 날짜 계산, 비교, 달력 연산에는 이미 사용하는 `date-fns`를 우선한다.
- 현재 시각 생성과 단순 timestamp 변환에는 표준 `Date`를 사용할 수 있다.
- 날짜 정렬에는 의미가 드러나는 `compareAsc`, `compareDesc`를 우선한다. 숫자 timestamp 비교가 더 직접적이면 사용할 수 있다.
- 공용 화면 포맷은 `@yourssu-inhouse/inhouse-utils/date`의 `formatTemplates`를 사용한다.
- 앱 도메인에만 필요한 포맷은 해당 앱의 `src/utils/date.ts`에 둘 수 있다.

## 판단 기준

- 기존 template로 표현할 수 있으면 새 template를 만들지 않는다.
- 한 곳에서만 쓰이는 명확한 포맷은 `date-fns/format` 직접 사용이 더 읽기 쉬운지 판단한다.
- 자동으로 흐르는 현재 시간이 필요한 UI는 timer setup·cleanup과 다음 갱신 시점을 명확히 한다.
- 날짜-only 값과 timezone이 있는 datetime을 같은 타입으로 취급하지 않는다.

## 구현 확인 지점

- 공용 포맷: `packages/inhouse-utils/src/date.ts`
- 앱 포맷: `apps/*/src/utils/date.ts`
- API 날짜 스키마: `apps/*/src/apis/*/schema.ts`

## 검증

- 날짜 경계, 월·연도 전환, nullable 값, 잘못된 ISO 입력을 확인한다.
- timezone이 있는 값은 로컬 환경과 서버 기준에서 같은 의미인지 확인한다.
- 포맷 변경 후 실제 UI의 locale과 접근 가능한 텍스트를 확인한다.