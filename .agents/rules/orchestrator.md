---
trigger: always_on
description: 항상 실행되는 기본 백그라운드 규칙. 사용자의 요청 사항을 분석하고 상황에 맞는 세부 규칙 문서(Rule)를 오케스트레이션(호출/참조)하는 데 사용됩니다.
globs: *
---

# 🤖 Agent Rules Orchestrator (항상 켜져있는 룰)

당신은 Yourssu Inhouse Client 프로젝트의 코드를 작성하고 리뷰하는 전문 AI 에이전트입니다.
이 문서는 **항상 켜져있는 핵심 오케스트레이션 가이드**입니다.
작업을 시작하기 전에 **반드시 사용자의 요청(Prompt)과 현재 수정하려는 코드(Context)의 상황을 분석**하고, 아래에 정의된 상황(Situation) 중 일치하는 것이 있다면 해당 규칙 문서(`.agent/rules/*.md`)를 추가로 읽고 지침을 적용하세요.

## 🔀 상황별 룰 (Model Decision Trigger)

사용자의 요청 내용을 바탕으로, 아래 조건에 맞는 룰 파일들을 식별하고 그 원칙들에 따라 코드를 작성하세요.

### 1. 전반적인 코드 룰 및 타입 구조 고민 시

- **Trigger**: "새로운 컴포넌트나 함수의 기본 구조를 잡아줘", "변수명을 어떻게 지을까?", "새로운 파일/폴더 이름은 어떻게 할까?", "상수 이름을 지어줘", "네이밍 룰에 맞춰줘", "임포트 경로(import path)를 어떻게 작성할까?"
- **Action**: `rule-naming.md` 규칙을 적용합니다. (모든 변수명/상수명 camelCase 통일, 화살표 함수 선언, 폴더/파일명 규칙 준수, 절대 경로 임포트 원칙 준수)

### 1-1. 새로운 타입(`type`) 구조 설계 시 고민 시

- **Trigger**: "새로운 타입이나 스키마 코드를 짜줘", "여기에 interface를 쓸까 type을 쓸까?"
- **Action**: `rule-type-system.md` 규칙을 적용합니다. (`interface` 대신 `type` 권장, 런타임 호환성 등)

### 1-2. 코드 작성 및 수정 완료 시 (검증)

- **Trigger**: "코드를 다 작성했어", "이제 마무리하고 결과 줘", "포맷팅이나 린터 규칙에 맞게 실행해줘", "타입 에러 확인해줘"
- **Action**: `rule-test-after-generation.md` 규칙을 적용합니다. (작업 후 `pnpm check:type`, `pnpm fix:lint`, `pnpm fix:format` 스크립트 실행 후 점검)

### 2. 페이지 추가, URL 변경, 폴더 스캐폴딩 시

- **Trigger**: "새로운 라우트(페이지)를 뚫어줘", "Feature 폴더 구조를 잡아줘", "URL 파라미터를 추가해줘"
- **Action**: `rule-routing.md` 규칙을 적용합니다. (TanStack Router `~` 접두사, Colocation 원칙 준수)

### 3. API 통신, 데이터 Fetching, 스키마 정의 시

- **Trigger**: "백엔드 API를 연동해줘", "React Query(+ky) 훅을 짜줘", "응답 데이터 타입(Zod)을 만들어줘"
- **Action**: `rule-api-data-fetching.md` 규칙을 적용합니다. (Zod Schema 파싱 로직, `queryOptions` 기반 Query 훅 구성 준수)

### 4. 상태 관리, Context API 설계 시

- **Trigger**: "이 데이터를 여러 컴포넌트에서 쓰게 전역 상태로 빼줘", "Provider와 Context를 작성해줘", "상태 관리를 어떻게 할까"
- **Action**: `rule-state-context.md` 규칙을 적용합니다. (Context 선언/로직 분리, URL query state 활용 준수)

### 5. 컴포넌트 UI/스타일링 조작 시

- **Trigger**: "컴포넌트 디자인을 바꿔줘", "Tailwind CSS 클래스를 넣어줘", "디자인 토큰/색상을 적용해줘"
- **Action**: `rule-styling-ui.md` 규칙을 적용합니다. (`tw.ts`의 `cn()`, `tailwind-variants(tv)` 사용 준수)

### 6. 인증/인가, 로그인 흐름 보수 시

- **Trigger**: "로그인 페이지 리다이렉션을 손봐줘", "API 호출 시 들어가는 토큰 로직을 고쳐줘", "권한 가드(Auth Guard)를 추가해줘"
- **Action**: `rule-auth.md` 규칙을 적용합니다. (ky 훅 단에서의 토큰 주입/리프레시, `_auth` 라우트 기반의 beforeLoad 가드 준수)

### 7. 날짜 처리, 시간 포맷팅, 캘린더 구현 시

- **Trigger**: "날짜 형식을 변경해줘", "현재 시간을 가져와줘", "캘린더나 날짜 더하기 기능을 짜줘"
- **Action**: `rule-date-handling.md` 규칙을 적용합니다. (date-fns 사용, 배열 정렬 시 compareAsc/Desc 사용, Zod의 z.iso.XXX 검증, UI 레이어 한정 formatTemplates 사용 준수)

### 8. 다이얼로그, 오버레이 조작 시

- **Trigger**: "다이얼로그나 팝업을 띄워줘", "모달을 열어줘", "바텀 시트를 추가해줘"
- **Action**: `rule-overlays.md` 규칙을 적용합니다. (`overlay-kit`을 이용한 명령형 띄우기 원칙 준수)

### 9. 컴포넌트 신규 작성 및 구조 설계 시

- **Trigger**: "새로운 컴포넌트를 만들어줘", "컴포넌트를 분리해줘", "UI 컴포넌트 스캐폴딩을 짜줘"
- **Action**: `rule-component-structure.md` 규칙을 적용합니다. (3단계 컴포넌트 구조 패턴, Props 구성, 네이밍/폴더 구조 원칙 준수)

### 10. 컴포넌트 내부 로직 처리 패턴 시

- **Trigger**: "컴포넌트 로직을 어떻게 짤까?", "조건부 렌더링을 어떻게 할까?", "검색/필터링 최적화를 해줘"
- **Action**: `rule-component-logic.md` 규칙을 적용합니다. (useSetStateSelector 그룹화, SwitchCase 사용, Render Props 패턴, startTransition/useDelayedValue 훅 활용)

### 11. 컴포넌트 내 불필요한 Effect(useEffect) 제거 시

- **Trigger**: "useEffect를 안 쓰고 로직을 구현해줘", "파생 상태(derived state)를 계산해줘", "부수 효과 최적화를 해줘"
- **Action**: `rule-no-useeffect.md` 규칙을 적용합니다. (이벤트 핸들러에서의 즉시 실행, `key`를 활용한 초기화 패턴, `useMemo` 사용 등 가이드)

### 12. 전체 프로젝트/기능별 폴더 구조 설계 시

- **Trigger**: "새로운 기능의 폴더 구조를 어떻게 잡아야 해?", "루트 파일들의 역할이 뭐야?", "파일의 적절한 위치를 찾아줘"
- **Action**: `rule-folder-structure.md` 규칙을 적용합니다. (루트 및 src 폴더 아키텍처, Feature Colocation 트리 구조 가이드)

### 13. 코드 리팩토링 및 구조/가독성 개선 시

- **Trigger**: "리팩토링 해줘", "코드를 다듬어줘", "가독성을 개선해줘", "선언적으로 바꿔줘"
- **Action**: `rule-refactoring.md` 규칙을 적용합니다. (모든 Rule 통합 점검, 상위/부모 레이어 맥락 파악, 선언적 추상화 패턴 발굴, 뇌과학 기반 청킹/인지 부하 최소화)

---

> **⚠️ 지시사항**: 모델은 주어진 작업을 수행할 때, 여러 개의 상황이 겹친다면 해당하는 **모든 Rule 파일의 원칙을 합산하여 준수**해야 합니다. (예: "새로운 API를 붙인 새로운 페이지 만들기" -> `rule-routing.md` + `rule-api-data-fetching.md` + `rule-core-conventions.md` 참조)
