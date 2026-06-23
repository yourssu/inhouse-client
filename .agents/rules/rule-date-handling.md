---
trigger: model_decision
description: 날짜를 포맷팅하거나, 날짜 관련 유틸리티를 사용하거나, 날짜 데이터를 다룰 때 읽어야 합니다.
globs: src/utils/date.ts, src/types/**/*.ts, src/components/**/*.tsx
---

# Date Handling (날짜 처리)

이 문서는 프로젝트에서 날짜(Date) 데이터를 다루고, 포맷팅하며 처리하는 공통적인 규칙을 정의합니다. `src/utils/date.ts` 를 기준으로 작성되었습니다.

## 1. 날짜 라이브러리 (date-fns)

- 날짜 처리 관련 라이브러리는 **오직 `date-fns`만 사용**합니다. (`moment`, `dayjs` 등 사용 금지)
- 날짜 관련 유틸리티(예: 같은 날짜인지 확인, 요일 계산, 날짜 차이 구하기 등)가 필요하면 반드시 `date-fns` 내장 함수를 먼저 찾아 사용하세요. (필요 시 Model Context Protocol(Context7 등)을 통해 date-fns 문서를 검색하고 참고하세요)
- **현재 시간**을 가져오는 경우는 기본 JavaScript의 `new Date()`를 사용합니다.
- **날짜 정렬**: 배열 데이터에서 날짜를 기준으로 정렬할 때는 `date-fns`의 `compareAsc`(오름차순), `compareDesc`(내림차순)를 활용하세요.

  ```tsx
  import { compareAsc, isSameDay } from 'date-fns';

  const getDateSchedules = (date: Date) =>
    schedules
      .filter(({ startTime }) => isSameDay(startTime, date))
      .toSorted((a, b) => compareAsc(a.startTime, b.startTime));
  ```

## 2. 날짜 스키마 검증 (Zod)

- 서버(백엔드)와 프론트엔드 간 통신 시, 서버에서는 기본적으로 Date 형식을 ISO Time으로 통일해서 응답합니다.
- API 응답 타입을 검증하거나 데이터를 처리하기 위해 Zod(`z`)를 사용할 때, 날짜 필드는 반드시 **Zod v4의 `z.iso.date()`, `z.iso.datetime()` 등 `z.iso.XXX`** 메서드를 사용하여 검증하세요. 이를 통해 안전하게 파싱할 수 있습니다.

## 3. 포맷팅 템플릿 사용 (formatTemplates)

- 날짜를 화면에 표시할 때는 `src/utils/date.ts` 파일의 **`formatTemplates`** 객체를 활용합니다. 내부적으로 `date-fns`의 포맷팅 로직과 한국어 로케일(`ko`)이 세팅되어 있습니다.
- 만약 화면 렌더링에 필요한 날짜 포맷이 있다면, 기존 형태를 참고하여 `formatTemplates`에 직접 추가한 뒤 사용할 수 있습니다.
- **사용 계층 의존성 주의점**: `formatTemplates`는 **반드시 UI 뷰 레벨(View Layer)에서만 사용**해야 합니다.
  - 데이터 통신(Network Layer) 과정이나, 데이터를 재조립/가공하는 계층(React 비즈니스 로직 레벨)에서는 포맷팅 함수를 사용하지 말고 원본 ISO String 또는 `Date` 객체 형태를 유지해야 합니다.
  - 화면에 그리기 직전인 뷰 컴포넌트 레이어에서만 포맷팅을 수행하세요.
