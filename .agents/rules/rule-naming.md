---
trigger: model_decision
description: 코드 작성 시 폴더명, 파일명, 변수명(상수 포함) 등의 네이밍 규칙을 정의할 때 읽어야 합니다.
globs: src/**/*.{ts,tsx}
---

# Naming Conventions (네이밍 규칙)

이 문서는 프로젝트 내의 폴더, 파일, 변수 등의 작명(Naming) 규칙에 대해 다룹니다. 파일을 새로 만들거나 폴더를 구성하고, 변수를 선언할 때 이 규칙을 철저히 따라주세요.

## 1. 폴더명 규칙

프로젝트 아키텍처 트리 및 기능(Feature) 폴더 구성에 따른 이름 짓기 규칙입니다.

- **컴포넌트 폴더 (`PascalCase`)**: UI 컴포넌트나 라우트 내 `components/` 폴더 하위의 개별 컴포넌트 폴더명은 `PascalCase`로 작성합니다.
  - 예시: `src/components/AdaptiveLogo/`, `src/routes/.../components/TemplateEditorDialog/`, `src/routes/~_auth/~recruit/~mail/components/VariableList/`
  - 단, **공용 UI 프리미티브**(Button, Dialog, Table, Badge 등)는 앱 `src/components`가 아닌 `@yourssu-inhouse/interior` 패키지에 속합니다. 앱의 `components/`는 도메인 특화 합성 컴포넌트만 둡니다.
- **라우터 폴더 (특수 패턴)**: TanStack Router에 의해 렌더링을 관장하는 라우트 폴더명은 `~` 접두사와 함께 영문 소문자(`kebab-case` 권장)를 사용합니다.
  - 예시: `src/routes/~_auth/`, `src/routes/~signin/`, `src/routes/~recruit/`
- **일반 모듈/기능 폴더 (`camelCase` 또는 `kebab-case`)**: 라우터나 컴포넌트가 아닌 일반적인 범용 디렉토리(`hooks`, `utils`, `apis`)나 하위 카테고리는 소문자 기반으로 작성합니다. (공용 UI 프리미티브는 앱 `src/components`가 아닌 `@yourssu-inhouse/interior` 패키지에 속합니다.)

## 2. 파일명 규칙

각 파일 내부에서 정의되는 주요 요소의 성격에 맞춰 파일명을 명명합니다.

- **컴포넌트 파일 (`PascalCase`)**: React 컴포넌트를 반환하는 파일(`.tsx`)은 내부 컴포넌트명과 동일하게 `PascalCase`로 작성합니다.
  - 단, TanStack 라우터 파일(`~__root.tsx`, `~_auth.tsx`, `~index.tsx` 등)은 폴더명과 마찬가지로 라우팅 네이밍을 따릅니다.
  - 예시: `src/components/Paper.tsx`, `src/components/AdaptiveLogo/index.tsx`, `src/routes/.../components/VariableList/index.tsx`
- **일반 로직 파일 (`camelCase`)**: 유틸리티, 훅, 컨텍스트, 타입, API 통신 등 순수 TS 로직을 담은 파일(`.ts`, `.tsx`)은 `camelCase`로 작성합니다.
  - 예시: `src/utils/date.ts`, `src/hooks/useDelayedValue.ts`, `src/apis/error.ts`, `src/routes/.../context.ts`

## 3. 변수명 규칙 (상수 포함)

**모든 변수명은 예외 없이 기본적으로 `camelCase`로 통일합니다.**

- **상수(Constants)의 경우에도** 대문자 스네이크 케이스(`UPPER_SNAKE_CASE`)를 사용하지 않고 일관되게 `camelCase`를 사용합니다.
  - 예시:

    ```typescript
    // Bad (UPPER_SNAKE_CASE 지양)
    const MAX_COUNT = 10;
    const API_BASE_URL = 'https://api.example.com';
    const DEFAULT_FORMAT_TEMPLATE = 'YYYY-MM-DD';

    // Good (모든 변수명은 상수 여부와 관계없이 camelCase로 통일)
    const maxCount = 10;
    const apiBaseUrl = 'https://api.example.com';
    const defaultFormatTemplate = 'YYYY-MM-DD';
    ```

- **컴포넌트(함수) 네이밍 방어 원칙**: 화살표 함수로 컴포넌트를 선언할 때, 함수명(변수명)은 파일명과 동일하게 `PascalCase`를 예외적으로 허용하고 사용합니다. (이것은 리액트의 컴포넌트 식별자로 취급되기 때문입니다).
  - 예시:
    ```tsx
    // Good: 파일명이 MyComponent.tsx 일 때
    export const MyComponent = () => {
      return <div />;
    };
    ```

## 4. 함수 선언 방식 (Arrow Function)

**모든 함수 선언은 화살표 함수(Arrow Function)를 기본으로 합니다.**

- 일반적인 유틸리티 함수나 React 컴포넌트를 정의할 때 `function` 키워드의 사용을 지양하고, `const name = () => {}` 형태를 일관되게 적용합니다. 이 원칙은 네이밍과 더불어 코드의 형태적 통일성을 위해 반드시 지켜져야 합니다.
  - 예시:

    ```typescript
    // Bad
    export function calculateTotal(items) { ... }

    // Good
    export const calculateTotal = (items) => { ... };
    ```

## 5. Import Path Rules (임포트 경로 규칙)

**모든 `import` 경로는 반드시 절대 경로(Absolute Path)를 사용합니다.**

- **앱 내부 모듈**: 각 앱의 `tsconfig`에 정의된 `@/` alias(해당 앱의 `src/`)를 사용합니다. `@/`는 **현재 작업 중인 앱의 `src/`**를 가리키며, 다른 앱이나 패키지 내부를 가리키는 데 쓰지 않습니다.
- **공용 패키지**: `packages/*`의 워크스페이스 패키지는 패키지명(`@yourssu-inhouse/...`)과 서브패스로 import합니다. (예: `@yourssu-inhouse/interior`, `@yourssu-inhouse/interior-tailwind/utils`, `@yourssu-inhouse/inhouse-utils/date`, `@yourssu-inhouse/auth`)
- **상대 경로 금지**: `../` 또는 `./` 와 같은 상대 경로의 사용을 금지합니다. 같은 폴더 내의 아주 밀접한 관계를 가진 컴포넌트나 스타일 파일이더라도 `@/` 기반의 절대 경로로 통일해야 합니다.
- **이유**: 프로젝트 구조가 깊어지더라도 임포트 경로의 가독성을 유지하고, 파일 이동 시 리팩토링 비용을 최소화하기 위함입니다.

- **예시**:

  ```typescript
  // Bad: 상대 경로 사용
  import { Button } from '../../components/Paper';
  import { useAuth } from '../hooks/useAuth';
  import { cn } from '../../utils/tw';

  // Good: @/ Alias(앱 내부)와 워크스페이스 패키지명(공용)을 구분해 사용
  import { Paper } from '@/components/Paper';
  import { useAuth } from '@/hooks/useAuth';
  import { Button, Dialog } from '@yourssu-inhouse/interior';
  import { cn, tv } from '@yourssu-inhouse/interior-tailwind/utils';
  import { useSetStateSelector } from '@yourssu-inhouse/inhouse-react/hooks';
  ```
