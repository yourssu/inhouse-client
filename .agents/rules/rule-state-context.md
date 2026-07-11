---
trigger: model_decision
description: 앱이나 피쳐 단위의 상태를 관리하거나 Context API를 작성·수정할 때 읽어야 합니다.
globs: src/**/context.{ts,tsx}
---

# State Management & Context API (상태 관리 원칙)

이 문서는 React 내에서 UI 상태나 비즈니스 데이터를 어떠한 방식으로 공유하고 격리해야 하는지 기준을 제공합니다.

## 1. 지역 상태 (Local State) 우선

- 언제나 `useState`와 `useReducer`, `url`(query param)을 최우선으로 고려합니다.
- `useCallback`과 콜백 prop으로 전달할 수 있다면, Context로 확장하지 않습니다.
- URL Query Parameter로 제어가 가능한 상태(현재 선택된 탭, 검색어, 필터 등)는 반드시 각 앱의 `useSearchState`(`@/hooks/useSearchState`)로 제어해야 합니다.

## 2. 전역/공용 상태 - Context API 패턴 (Provider & Hook)

Context를 사용하는 경우는 해당 컴포넌트 트리 하위에 위치한 여러 뎁스의 자식 컴포넌트들이 동일한 상태에 접근해야 할 때 사용합니다. 사용할 때는 반드시 아래와 같이 `es-toolkit`의 `assert`를 활용한 템플릿 패턴을 유지해 주세요.

- **Context 선언 및 훅 구성 (`context.ts` 파일 분리 - 프로젝트 공통 규칙)**:
  특별한 경우가 아니면 Context 선언과 커스텀 훅(값 검증 포함)은 무조건 독립적인 `context.ts` 파일로 분리해야 합니다.
- **단일 책임 원칙 (하나의 Context에는 하나의 맥락만)**:
  `useXXXContext`를 호출할 때 어떤 데이터를 다루는지 직관적으로 알 수 있도록, 하나의 Context에는 단일 맥락(관심사)만을 담는 것을 권장합니다.
  만약 여러 맥락의 전역 상태가 필요하다면, `context.ts` 파일에 아래 선언 패턴을 활용하여 여러 개의 Context(및 Hook)를 만들고, 뷰 컴포넌트에서 여러 개의 Provider를 중첩하는 방식(`<AContext.Provider><BContext.Provider>`)으로 사용해 주세요.
- **Provider 컴포넌트 생성 금지 (응집도 유지)**:
  `context.ts` 내부에 별도의 Provider Wrapping 컴포넌트(`export const MyProvider = ...`)를 절대 만들지 마세요. 응집도를 높이기 위해, 상태 선언(`useState`, 등)과 함수들은 모두 `<Context.Provider>`를 실제로 사용하는 뷰 컴포넌트 내부에서 선언하고, 해당 컴포넌트에서 직접 `<Context.Provider value={{...}}>` 형태로 주입하여 사용합니다.

  ```tsx
  import { assert } from 'es-toolkit';
  import { createContext, useContext } from 'react';

  // 1. 상태 및 액션 메서드의 타입 정의
  interface FeatureContextType {
    value: string;
    updateValue: (newValue: string) => void;
  }

  // 2. Context 선언 (기본값은 무조건 null)
  export const FeatureContext = createContext<null | FeatureContextType>(null);

  // 3. 하위 컴포넌트 내부에서만 사용할 수 있도록 강제하는 커스텀 Hook
  export const useFeatureContext = () => {
    const context = useContext(FeatureContext);
    // 4. es-toolkit의 assert를 활용하여 Provider 하위에서 사용되었는지 검증
    assert(!!context, 'useFeatureContext는 FeatureContext.Provider 하위에서 사용해야해요.');
    return context;
  };
  ```

## 3. Zustand, Jotai 등 서드파티 스토어 라이브러리 추가 도입 금지

특별한 이유가 없다면 이미 세팅된 기능 (`TanStack Query` + `Context API` + `url params` + `Local State`) 의 조합으로 문제를 해결하세요.
(만약 꼭 필요한 예외라면 설계 및 도입 토론 후 적용합니다.)
