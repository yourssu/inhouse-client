---
trigger: model_decision
description: 컴포넌트를 새롭게 작성, 분리, 또는 기본 구조(스캐폴딩)를 구성할 때 읽어야 합니다. 파일명, Props 패턴, 3단계 작성 구조의 원칙을 담고 있습니다.
---

# Component Creation Rules (컴포넌트 작성 규칙)

React 컴포넌트를 새롭게 작성하거나 수정할 때 준수해야 하는 파일 네이밍 및 코드 스캐폴딩 구조 규칙입니다.

## 1. 컴포넌트 파일 및 폴더 네이밍

- **기본 네이밍**: 컴포넌트 파일명과 내부의 컴포넌트 함수 이름은 서로 **일치**해야 하며, 반드시 **PascalCase**로 작성합니다. (예: `Button.tsx` -> `export const Button`)
- **컴포넌트 분리 (폴더화)**: 컴포넌트의 규모가 커져서 내부에서 여러 서브 컴포넌트로 분리해야 하는 경우 다음을 따릅니다:
  - 해당 컴포넌트 이름과 완전히 똑같은 이름의 **폴더**를 생성합니다.
  - 메인이 되는 부모 컴포넌트 코드는 그 폴더 안의 `index.tsx`에 작성합니다.
  - 이때 `index.tsx` 내부에서 export 하는 컴포넌트 이름은 **폴더명(실제 메인 컴포넌트 이름)**으로 지정합니다.
  - (예: `VariableList` 폴더 안의 `index.tsx`에서는 `export const VariableList = () => {}` 로 작성)
  - 연관된 서브 컴포넌트(`VariableField.tsx` 등)도 해당 폴더에 모아 응집도를 높입니다. (Colocation)

## 2. 컴포넌트 코드 작성 패턴 (3단계 구조)

모든 컴포넌트 파일은 가독성과 유지보수성을 위해 아래와 같이 **3단계 영역**으로 구분하여 일관되게 구조화합니다.

```tsx
// [Imports] 모듈 및 컴포넌트 임포트
import { useState } from 'react';
import { cn } from '@yourssu-inhouse/interior-tailwind/utils';

// === 1. Props 및 필요 타입들 ===
// 컴포넌트 이름 뒤에 'Props'를 붙이는 형식으로 작성합니다.
interface XXXProps {
  title: string;
  isActive?: boolean;
}

// === 2. 컴포넌트 본체 코드 ===
// 화살표 함수를 사용하며 Named Export를 기본으로 합니다.
// Props는 매개변수 부분에서 구조 분해 할당(Destructuring)하여 받습니다.
export const XXX = ({ title, isActive }: XXXProps) => {
  // 상태 선언 (useState 등)
  // ...

  // 이벤트 핸들러 및 파생 로직
  // ...

  return <div>{/* JSX 렌더링 코드 */}</div>;
};

// === 3. 렌더링에 필요한 정적 값 (상수 선언부) ===
// 렌더링에 필요한 상수, 정적 배열 등 상태 변화가 없는 값은 매번 재생성되지 않도록 컴포넌트 바깥 아래에 선언합니다.
// 상수 등의 네이밍은 기본적으로 camelCase를 사용합니다. (단, 기획적으로 특별히 지정된 포맷이 있다면 제외)
const contentNames = ['item1', 'item2', 'item3'];
```

## 3. 컴포넌트 작성 주요 원칙

- **화살표 함수 사용**: 컴포넌트를 선언할 때 `function` 키워드보다 화살표 함수(`const XXX = () => ...`)를 지향합니다.
- **Named Export 사용**: 프레임워크 구조상 `export default`가 강제되는 경우(예: TanStack 라우터의 주요 페이지 컴포넌트)를 제외하고 가급적 **Named Export**(`export const ...`)를 사용합니다.
- **Props 파라미터 컨벤션**: 컴포넌트 함수 내부에서 `props.title`처럼 접근하지 않고, 미리 첫 번째 파라미터에서 구조 분해 할당으로 풀어서 받습니다.
- **코드 길이 최소화 및 단일 책임**: 하나의 컴포넌트 파일이 일정 라인 수(약 150~200줄)를 초과하여 비대해지지 않도록 주의합니다. 컴포넌트가 너무 커진다면 하단의 **5. 컴포넌트 분할 기준**을 참고하여 서브 컴포넌트로 분할하세요.

## 4. 컴포넌트 본체(Body) 내부 로직 배치 순서 (Flow Pattern)

컴포넌트의 본체 내부(위 3단계 구조 중 '2. 컴포넌트 본체 코드')는 일관된 흐름을 가지도록 아래 영역 순서대로 코드를 배치합니다. 목적별로 훅과 상태를 모아두어 코드 가독성을 높입니다.

- **예외 (Setter 로직)**: 단순 상태 업데이트만을 위한 함수(setters)는 `useCallback` 등을 사용하더라도 5번 '핸들러 영역'이 아닌, 2번 **'내부 상태 영역'의 해당 상태 선언 바로 아래**에 배치하여 응집도를 높입니다.

```tsx
const Comp = ({ value }: CompProps) => {
  // 1. 상위 레이어 훅 및 전역 상태 호출 영역
  const toast = useToast();
  const [search, setSearch] = useSearchState();
  const [loading, startLoading] = useLoading();
  const parsedValue = useParsedCompValue(value);

  // 2. 내부 상태 영역
  const [isActive, setIsActive] = useState(false);
  // (Exception) 상태 업데이트 전용 로직은 상태 선언 바로 아래 배치
  const toggleActive = () => setIsActive((prev) => !prev);

  const setters = {
    v: useSetStateSelector(...),
  };

  // 2+. 내부 상태가 필요한 훅 호출 영역 (대개 커스텀 훅)
  const a = useFromIsActive(isActive);

  // 3. 쿼리 상태 영역 (서버 상태 및 호출)
  const { data: members } = useSuspenseQuery(...);
  const { mutateAsync } = useMutation(...);
  const { invalidate } = useQueryInvalidation([...]);

  // 4. State-driven 영역 (파생 상태)
  const member = members.find(...);
  const sortedMembers = members.toSorted(...);

  // 5. 핸들러 영역 (사용자 액션/비즈니스 로직)
  const onSubmit = () => {
    if (isActive) mutateAsync(...);
  };

  // 6. 마크업 렌더링 영역
  return <div>...</div>;
};
```

## 5. 컴포넌트 분할 기준

컴포넌트는 특정 기능이나 재사용 가능한 UI 단위 하나만을 수행하도록 분리하며, 코드 줄 수를 최대한 적게 가져가야 합니다. 파일 라인 수 스케일이 비대해진다면 다음 기준에 따라 적극적으로 서브 컴포넌트 및 베이스 컴포넌트로 분할하세요.

- **순수 UI 기능 분리**: 복잡한 조건부 렌더링이나 특정 데이터(상태)에 따른 스타일/텍스트 분기 로직은 하나의 커다란 컴포넌트 내부의 함수로 두지 않고, 독립된 작은 UI 컴포넌트로 분리합니다. (예: 테이블 내부에서 역할별 뱃지와 텍스트 렌더링만 전담하는 `MemberRoleText.tsx`)
- **공통 베이스 UI 추출**: 애플리케이션 곳곳에서 쓰이는 유사한 테이블 내지 리스트 형태에서, 내부의 특정 컬럼 구성만 달라질 때는 중복 로직(검색 결과, 필터, 페이징, 빈 결과창 등)과 전체 레이아웃 구성을 한데 묶은 '베이스 뼈대 컴포넌트'를 만들고 Render Props 패턴(`children: (item) => React.ReactNode`)을 사용해 확장 가능하도록 책임을 분할합니다. (예: 공통 검색/페이징과 테이블 껍데기를 추출한 `BaseMembersTable.tsx`)
