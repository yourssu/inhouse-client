---
trigger: model_decision
description: 새로운 타입(`interface`, `type`)을 정의하거나 스키마(Zod 등)를 다룰 때, 타입 호환성과 일관성을 유지하기 위해 읽어야 합니다.
globs: src/**/*.{ts,tsx}
---

# Type System Conventions (타입 시스템 규칙)

이 문서는 프로젝트 내에서의 TypeScript 타입 선언과 관련된 기본 규칙을 명시합니다. 타입을 새롭게 작성하거나 리팩토링할 때 이 원칙을 반드시 준수하세요.

## 1. Type Alias 우선 사용

타입스크립트 명세 상 커스텀 타입을 정의할 때 `interface`와 `type` alias를 모두 사용할 수 있지만, 우리 프로젝트에서는 **`type` alias 사용을 강력히 권장**합니다.

- **이유**:
  - `Zod` 스키마 추론(`z.infer`) 결과와의 형태적 호환성이 더욱 자연스럽습니다.
  - `ts-pattern` 등 기타 유틸리티 라이브러리를 사용할 때 타입 결합(Intersection, Union)의 자유도와 일관성을 높일 수 있습니다.
  - 특별히 `interface`의 선언 병합(Declaration Merging)이 필요한 경우가 아니라면 기본적으로 `type`을 사용해 코드 형태를 통일합니다.

### ⚠️ 예외: 컴포넌트 Props 타입 정의

기본적으로 **컴포넌트의 Props 타입을 정의할 때는 `interface`를 사용**합니다. (세부 사항은 `rule-component-structure.md`를 참고하세요.)

하지만, 컴포넌트 Props 타입이라도 **아래와 같이 유틸리티 타입 조작이나 타입 결합이 필요한 경우에는 예외적으로 `type`을 사용**합니다.

1. `Merge` 등 커스텀 유틸리티 타입을 사용하여 타입을 확장하는 경우
2. `React.ComponentProps<typeof ...>` 등을 사용하여 기존 컴포넌트의 속성을 추출하는 경우
3. `React.TdHTMLAttributes<...>` 등에 `&` (Intersection) 연산자로 새로운 타입을 결합하는 경우

## 2. 예시 코드

```typescript
// Bad
export interface UserInfoProps {
  id: string;
  name: string;
  age?: number;
}

// Good
export type UserInfoProps = {
  id: string;
  name: string;
  age?: number;
};

// Zod 의존성 타입과도 어울림
import { z } from 'zod';

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type User = z.infer<typeof userSchema>;
```

## 3. 유틸리티 타입의 활용

- 필요하다면 `@/types/misc` 경로(`src/types/misc.ts`)에 선언된 커스텀 유틸리티 타입들(`Prettify`, `Merge`, `ValueOf` 등)을 적극 활용할 것을 권장합니다.
- 코드를 작성할 때 재사용 가능한 범위의 타입들을 발견하게 된다면 `misc.ts` 등에 공통화하여 넣어두세요.

## 4. 상수 선언 시 `as const` 패턴 적극 활용

**Enum 사용은 엄격히 금지합니다.** 대신 객체 리터럴과 `as const` 패턴을 사용하세요.

- Non-driven, 콘텐츠 등 변하지 않는(readonly) 값을 객체나 배열로 작성 시 `as const` 패턴을 적극 활용하세요. `Record<K, V>` 형태의 타입 선언보다 동적 속성을 제한하고 추론을 강화하는 데 훨씬 좋습니다.
- 다른 타입에서 driven되어 변하지 않는 값을 작성해야 하는 경우, `as const satisfies ...` 패턴을 이용해 타입 에러를 미연에 방지하면서도 구체적인 리터럴 타입 추론을 살리세요.

```typescript
// Bad: Enum 금지
export enum MemberRole {
  ViceLead = '부리드',
  Member = '멤버',
  Lead = '리드',
}

// Good: as const satisfies 패턴 활용 (번역 네임 맵 등 객체 값)
export const memberRoleKo = {
  ViceLead: '부리드',
  Member: '멤버',
  Lead: '리드',
} as const satisfies Record<MemberRoleType, string>;
```

## 5. Type-safe 키-값 변환 (Enum 우회 기법)

Enum 대신 객체의 `as const` 패턴을 사용하면서, Value로 Key를 추론해야 하는 역방향 조회 상황이 발생한다면 `es-toolkit`의 `invert` 함수를 활용합니다.

```tsx
import { invert } from 'es-toolkit';
import { partNameKo } from '@/types/parts';

const onPartFilterChange = (v: PartNameKoType) => {
  // invert 함수를 통해 Value를 Key로 역치하여 접근합니다.
  const partNameEn = invert(partNameKo)[v];
  // ...
};
```

## 6. 엄격한 타입 시스템 유지 (강제 원칙)

타입 시스템을 강력하게 유지하세요.

- `as` 문법(Type Assertion)과 `any` 타입의 사용은 **최대한(거의 Must로) 금지**합니다.
- 이를 우회하기 위한 린터 비활성화 주석(`// eslint-disable-next-line @typescript-eslint/no-explicit-any` 등) 사용 역시 금지합니다.
- 가능한 한 타입 가드, 제네릭, Zod 등 외부 라이브러리의 파싱 기능(`safeParse` 등)을 사용해 타입을 좁혀나가세요.

## 7. 로직상 옵셔널 예외 처리 시 `assert` 활용

로직상으로 `undefined`나 `null`과 같은 Optional한 값을 처리함과 동시에, 값이 유효하지 않을 때 예외를 반환(Throw)해야 한다면 `es-toolkit`의 `assert`를 적극 활용하세요. 타입스크립트는 `assert`가 통과됨에 따라 이후 코드에서 Not Null 임을 보장(Narrowing)해 줍니다.

```tsx
import { assert } from 'es-toolkit';

const partNameEn = invert(partNameKo)[v];
const part = parts.find(({ partName }) => partName === partNameEn);

// part가 undefined일 경우, 에러를 던지며 타입 단언 효과를 얻습니다.
assert(!!part, '존재하지 않는 파트를 선택했어요.');

// 이 이후부터 part는 항상 정의된 상태로 타입 추론됨
startTransition(() => {
  setters.partId(part.partId);
});
```

## 8. DX 및 강력한 추론을 위한 Generic 활용

반복되는 컴포넌트나 강력한 타입 추론이 필요한 파라미터에서는 제네릭 매개변수를 적극 활용하여 사용하는 쪽의 개발 경험(DX)을 높여주세요.

```tsx
// src/components/_ui/Tab/index.tsx
// 제네릭 <TTab>을 통해 탭 아이템들의 타입을 외부에서 동적으로 추론할 수 있게 디자인합니다.
interface TabProps<TTab extends string> {
  children: (p: { tab: TTab }) => React.ReactNode;
  className?: string;
  defaultTab: TTab;
  onTabChange?: (value: TTab) => void;
  right?: React.ReactNode;
  tabs: TTab[];
}

export const Tab = <TTab extends string>({
  defaultTab,
  onTabChange,
  tabs,
  children,
  // ...
}: TabProps<TTab>) => {
  // 제네릭 기반 컴포넌트는 사용 시 <Tab tabs={['A', 'B']}> 처럼 주입하면
  // onTabChange의 인자가 'A' | 'B'로 자동 추론되어 편의성이 극대화됩니다.
};
```
