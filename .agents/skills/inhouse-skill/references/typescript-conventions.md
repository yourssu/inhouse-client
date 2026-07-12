# TypeScript와 네이밍

## 적용 범위

파일·폴더·식별자 이름, 함수 선언, export, 타입 단언을 작성하거나 변경할 때 적용한다. import 경로와 모듈 경계는 `project-architecture.md`를 함께 읽는다.

## 필수 규칙

- React 컴포넌트와 컴포넌트 파일·폴더는 `PascalCase`를 사용한다. 라우트 파일은 라우터의 `~` 규칙을 따른다.
- 훅은 `use`로 시작하고, 일반 함수·변수·상수는 의도를 드러내는 `camelCase`를 사용한다.
- TypeScript `enum`을 새로 만들지 않는다. 리터럴 객체·배열과 `as const`, 필요하면 `satisfies`를 사용한다.
- 타입 오류를 숨기기 위해 `as`, `any`, 린터 비활성화 주석을 사용하지 않는다.
- 외부 입력은 타입 단언으로 신뢰하지 말고 Zod, 타입 가드 또는 명시적인 검증으로 좁힌다.

## 타입 선언 기본 선택

- 컴포넌트 Props처럼 객체 계약을 직접 선언할 때는 `interface`를 기본으로 한다.
- union, intersection, mapped type, `React.ComponentProps`, `Omit`, `Merge`, Zod 추론처럼 타입 연산이 필요한 경우 `type`을 사용한다.
- API 타입은 스키마에서 `z.infer`로 파생하고 같은 구조를 수동으로 중복 선언하지 않는다.
- 범용 유틸리티 타입은 `@yourssu-inhouse/inhouse-utils/type`을 먼저 확인한다.
- 선언 병합이 필요하지 않은 일반 도메인 모델은 주변 코드와 결합 방식에 맞춰 `type` 또는 `interface`를 선택하되, 형식 통일만을 위해 기존 타입을 일괄 변경하지 않는다.

## 함수와 export 기본 선택

- 일반 함수와 컴포넌트는 화살표 함수와 named export를 기본으로 한다.
- hoisting, 재귀, overload 표현 또는 도구·런타임 제약 때문에 함수 선언이 더 명확하면 `function`을 사용할 수 있다.
- 프레임워크가 default export를 요구하지 않는 한 named export를 사용한다.
- Props는 컴포넌트 경계에서 구조 분해하되, 그대로 전달하는 wrapper처럼 `props` 객체가 더 명확한 경우는 예외로 한다.

## 타입 단언과 `any`의 제한적 예외

다음 조건을 모두 만족하는 좁은 경계에서는 타입 단언을 허용한다.

1. 외부 라이브러리, Module Federation, 직렬화, DOM 또는 표준 라이브러리의 타입 한계처럼 호출부에서 제거할 수 없는 경계다.
2. 단언이 작은 adapter·유틸 안에 격리된다.
3. 런타임 보장, 입력 검증 또는 라이브러리 계약이 가까운 코드나 윈인 주석로 확인된다.
4. 단언된 타입의 범위를 실제 보장보다 넓히지 않는다.

`any`보다 `unknown`을 우선한다. 라이브러리 콜백이 `any`를 요구하면 외부 경계에서만 받고 즉시 안전한 타입으로 좁힌다. `as const`와 `satisfies`는 이 제한의 대상이 아니다.

## 네이밍 판단 기준

- 이름은 구현 방식보다 역할과 보장 범위를 설명한다.
- boolean은 가능한 경우 `is`, `has`, `can`, `should` 등 조건 의미를 드러낸다.
- 약어는 프로젝트에서 널리 공유되는 용어만 사용한다.
- 파일 이름은 주요 export와 일치시키되, `index.ts(x)`, `context.ts`, `schema.ts`, `query.ts`처럼 역할 기반 진입 파일은 예외로 한다.
- UPPER_SNAKE_CASE 상수로 새 스타일을 만들지 말고 주변 모듈의 `camelCase` 관례를 따른다.

## 검증

- 변경한 워크스페이스에서 타입 검사와 린트를 실행한다.
- 단언을 추가했다면 단언이 필요한 외부 계약과 실패 시 동작을 검토한다.