---
trigger: model_decision
description: UI 컴포넌트의 디자인을 만질 때 읽어야 합니다.
globs: apps/*/src/components/**/*.{ts,tsx}, apps/*/src/styles/**/*.css, packages/interior/src/**/*.{ts,tsx}, packages/interior-tailwind/src/**/*.ts
---

# Styling & UI Components (컴포넌트 스타일링 방식)

이 프로젝트는 UI 컴포넌트의 스타일링에 Tailwind CSS V4 기반 기술 스택 (tailwind-variants, clsx, tailwind-merge) 과 Radix UI 등을 통합적으로 사용합니다.
Tailwind CSS V4 맥락이 부족하다면, context7 mcp를 사용해서 필요한 정보들을 가져오세요.

> 📌 **패키지 분산**: `cn`/`tv` 유틸과 디자인 토큰은 **워크스페이스 패키지**로 분리되어 있습니다.
>
> - `cn`, `tv` → `@yourssu-inhouse/interior-tailwind/utils` (`cn`은 clsx + interior-vars 기반 custom class group을 적용한 tailwind-merge, `tv`는 같은 merge 설정을 쓰는 tailwind-variants 래퍼)
> - 디자인 토큰 원천 → `@yourssu-inhouse/interior-vars` (`vars.color/shadow/typography/radius/transition/zIndex`)
> - Tailwind v4 테마 매핑 → `@yourssu-inhouse/interior-tailwind/plugin` (각 앱의 `src/styles/index.css`에서 `@plugin`로 로드)
> - 공용 UI 프리미티브(Button, Dialog, Table, Badge, Toast 등) → `@yourssu-inhouse/interior` (vanilla-extract + Radix 기반, `./index.css` 제공)

## 1. 전역 클래스 문자열 병합 (`cn()`) 및 조건부 스타일링 (`clsx`)

이 프로젝트에서는 스타일링 병합과 조건부 처리를 위해 `cn`과 `clsx`를 목적에 맞게 구분하여 사용합니다.

- **`cn`**: `props`로 겹침 예측이 불가능한 `className`을 받아서 병합(오버라이딩)해야 하는 경우에 사용합니다.
  - 병합 로직의 비용이 많이 들기 때문에, 꼭 **외부에서 주입되는 `className` 병합이 필요한 경우**에만 제한적으로 사용해야 합니다.

- **`clsx`**: 조건부 스타일링을 처리할 때 사용합니다.
  - 외부 `className` 병합이 필요하지 않다면 우선적으로 `clsx`로 해결할 것을 권장합니다.
  - 단, `clsx`는 Tailwind 클래스의 오버라이딩을 보장하지 않으므로, 충돌을 방지하기 위해 아래의 `Do` 패턴처럼 명시적인 조건부 처리를 하는 것을 "권장"합니다.

```tsx
// Dont (clsx 내에서 조건에 따라 클래스가 겹칠 경우 오버라이딩 보장 안됨)
<div className={clsx('text-grey800', invalid && 'text-red500')} />

// Do (상황에 따라 적절한 패턴을 사용할 것)
<div className={clsx(invalid ? 'text-red500' : 'text-grey800')} />
// or
<div className={clsx({
  'text-grey800': !invalid,
  'text-red500': invalid,
})} />
```

### 💡 프로젝트 내 실제 적용 예시

**1) `cn` 사용 예시 (외부 `className` 병합)**

```tsx
// packages/interior/src/components/Table/Th.tsx
import { cn } from '@yourssu-inhouse/interior-tailwind/utils';

export const Th = ({ children, className, align, ...props }: ThProps) => {
  // align에 따른 기본 스타일과 외부에서 주입된 className을 안전하게 병합하기 위해 cn 사용
  return (
    <th className={cn(th({ align }), className)} {...props}>
      {children}
    </th>
  );
};
```

**2) `clsx` 사용 예시 (내부 조건부 스타일링)**

```tsx
// packages/interior/src/components/Table/Th.tsx
import clsx from 'clsx';

export const ThContent = ({ value }: ThContentProps) => {
  // 외부 props 병합 없이 내부 상태(value)에 따른 텍스트 색상만 조건부 처리하므로 clsx 사용
  return <div className={clsx(value ? 'text-violet600' : 'text-neutralDisabled')}>{value}</div>;
};
```

## 2. 컴포넌트 스타일 변형 (`tailwind-variants`)

- 컴포넌트 내부에 다양한 크기(`size`), 모양(`variant`), 색상(`color`) 등을 설정할 때는 무조건 `tailwind-variants`의 `tv()`(`@yourssu-inhouse/interior-tailwind/utils`에서 import되는 커스텀 tv)를 이용합니다.
- `base` 속성에 컴포넌트의 기본이 되는 스타일(레이아웃, 폰트 굵기 등)을 지정합니다.
- `variants` 속성 내부에 각 변수(예: `color`, `size`)에 따라 달라지는 구체적인 Tailwind 클래스 조합을 구성합니다.
- 이를 통해 컴포넌트를 호출할 때 `size="md"`, `color="blue"` 같은 직관적인 Prop으로 스타일을 분기할 수 있습니다.

### 💡 프로젝트 내 실제 적용 예시

```tsx
// packages/interior/src/components/Badge/index.tsx
import { tv } from '@yourssu-inhouse/interior-tailwind/utils';

const badge = tv({
  // 기본 공통 스타일: 형태와 레이아웃 고정
  base: 'inline-flex h-fit w-fit rounded-full font-medium',
  variants: {
    // color 속성에 따른 배경/텍스트 색상 분기
    color: {
      blue: 'bg-blueOpacity50 text-blue600',
      green: 'bg-greenOpacity50 text-green600',
      grey: 'bg-greyOpacity50 text-grey600',
      red: 'bg-redOpacity50 text-red600',
      violet: 'bg-violet50 text-violet600',
      yellow: 'bg-yellow50 text-yellow600',
    },
    // size 속성에 따른 폰트 크기 및 여백 분기
    size: {
      xs: 'text-tiny px-1.5 py-0',
      sm: 'px-2 py-0.5 text-xs',
      md: 'text-13 px-2.5 py-1',
      lg: 'px-3 py-1.5 text-sm',
    },
  },
});
```

## 3. 디자인 토큰/컬러 팔레트 연동 (Theme Tokens)

- 디자인 토큰의 원천은 `@yourssu-inhouse/interior-vars`의 `vars` 객체(`vars.color`, `vars.shadow`, `vars.typography`, `vars.radius`, `vars.transition`, `vars.zIndex` 등)입니다. `@yourssu-inhouse/interior-tailwind/plugin`이 이 토큰들을 Tailwind v4 테마(`colors`, `fontSize`+`lineHeight`, `shadow`, `borderRadius`, `transitionTimingFunction`, `height`(uniformHeight), `zIndex`)로 매핑합니다.
- 임의로 하드코딩된 RGB/Hex 값을 사용하지 마세요. interior-vars에서 공급되는 시맨틱/시스템 토큰 클래스만 사용해야 합니다. (e.g. `text-neutral`, `bg-buttonPrimaryBackground` 등)
- 만약 색상 값을 직접 가져와서 JS에 써야 한다면 CSS Variable `var(--컬러명)` 형태로 가져오도록 합니다. (e.g. `var(--neutral)`)
- 각 앱의 `src/styles/index.css`는 `@import '@yourssu-inhouse/interior/index.css';`와 `@plugin '@yourssu-inhouse/interior-tailwind/plugin';`을 로드합니다. **remote 앱은 CSS를 MF로 따로 배포하지 않습니다** — shell(host)의 `index.css`에 있는 `@source '../../../*/src/**';` 글로브가 모든 `apps/*/src`를 스캔해 단일 CSS 번들로 묶으므로, remote 전용 utility도 자동 생성됩니다.

## 4. 아이콘 사용 가이드라인

- `react-icons` 라이브러리의 아이콘을 사용할 때, 디자인 시스템과 모양을 유사하게 맞추기 위해 **`Md` (Material Design) 및 `IoMd` (Ionicons Material)** 아이콘을 우선적으로 검색해서 사용하는 것이 좋습니다. (예: `MdArrowBack`, `IoMdClose`)

## 5. 다크 모드 스타일링 대응 가이드라인 (Dark Mode Selectors)

- 이 프로젝트는 `[data-theme='dark']` 속성을 기반으로 다크 모드를 판별합니다. (초기 테마는 `@yourssu-inhouse/interior`의 `initializeTheme()`이 부트스트랩 시 적용)
- 각 앱의 `src/styles/index.css`는 `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));`로 Tailwind v4 dark 변형을 등록합니다.
- CSS/Utility 파일 내부에서 다크 모드 스타일을 추가 대응할 때는 Tailwind v4 `@variant dark` 지시어 대신, 명시적으로 `[data-theme='dark']` 셀렉터를 nested 형태로 사용해야 합니다.
  - `@variant dark`는 빌드 프로세스나 선택자 우선순위에 따라 다르게 동작할 수 있으므로, 확실하게 `[data-theme='dark']`를 명시하는 방식을 권장합니다.
- **예시 (CSS Utility):**

  ```css
  @utility table-sticky-shadow-head {
    &::after {
      background: radial-gradient(
        100% 100% at 0 100%,
        rgba(0, 0, 0, 0.04) 0,
        rgba(0, 0, 0, 0) 100%
      );
    }

    [data-theme='dark'] &::after {
      background: radial-gradient(
        100% 100% at 0 100%,
        rgba(0, 0, 0, 0.15) 0,
        rgba(0, 0, 0, 0) 100%
      );
    }
  }
  ```

- 이와 같이 다크 모드 셀렉터 체인을 추가하여 라이트/다크 테마 환경에서 모두 조화로운 스타일을 갖추도록 하세요.
