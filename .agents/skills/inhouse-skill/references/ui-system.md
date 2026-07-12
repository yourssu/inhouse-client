# UI 시스템과 오버레이

## 적용 범위

Tailwind CSS, 디자인 토큰, `cn`·`clsx`·`tv`, 공용 UI primitive, 아이콘, 다크 모드, Dialog·Toast·overlay를 변경할 때 적용한다.

## 필수 규칙

- 공용 UI primitive가 필요하면 `@yourssu-inhouse/interior`를 먼저 확인한다.
- 앱 코드에서 새 색상·그림자·radius를 임의의 Hex·RGB 값으로 추가하지 않는다. `interior-vars`와 프로젝트 semantic token을 사용한다.
- 외부에서 받은 `className`과 기본 Tailwind class를 합칠 때는 `@yourssu-inhouse/interior-tailwind/utils`의 `cn`을 사용한다.
- `overlay-kit`을 사용하는 Dialog는 `isOpen`과 `close` 계약을 지키고 취소·외부 닫기·성공 결과를 구분한다.
- mutation을 실행하는 Dialog는 중복 제출을 막고 loading·성공·실패 상태를 사용자에게 보여준다.

## 스타일 도구 선택

- 단순 조건부 class에는 `clsx`를 사용한다. 서로 충돌하는 Tailwind class를 동시에 만들지 않도록 조건을 명확히 분기한다.
- 외부 `className` 병합이나 충돌 해결이 필요하면 `cn`을 사용한다.
- 크기·색상·상태처럼 이름 있는 variant 조합이 반복되면 `tv`를 사용한다.
- boolean 한 개의 짧은 분기나 한 번만 쓰는 class 조합까지 `tv`로 감싸지 않는다.
- JavaScript에서 토큰 값이 필요하면 `interior-vars`의 공개 값이나 CSS variable을 사용한다.

## 디자인 시스템 경계

- 토큰 원천: `@yourssu-inhouse/interior-vars`
- Tailwind v4 매핑과 `cn`·`tv`: `@yourssu-inhouse/interior-tailwind`
- Button, Dialog, Table, Toast 등 UI primitive: `@yourssu-inhouse/interior`
- 앱의 `src/components`: 앱 도메인에 특화된 합성 컴포넌트

토큰명, dark variant, CSS 배포 방식은 변경될 수 있으므로 다음 구현을 확인한다.

- `packages/interior-vars/src/`
- `packages/interior-tailwind/src/`
- `packages/interior/src/`
- `apps/*/src/styles/index.css`

## 오버레이 선택 기준

- 단순 확인·경고는 해당 앱에 `useAlertDialog`가 있으면 우선 사용한다.
- 탭 전환과 dirty-form 확인처럼 프로젝트 wrapper가 해결하는 문제는 `useTabDialog`를 사용한다.
- 독립적인 폼, 지역 상태, mutation을 가진 복잡한 Dialog는 별도 컴포넌트로 만들고 `overlay.openAsync`에서 마운트한다.
- wrapper가 표현하지 못하는 동작은 `overlay.open`·`openAsync`를 직접 사용할 수 있다. 단순히 직결 호출을 금지하지 않는다.

결과 타입은 설계 닫기 계약과 일치시킨다.

```tsx
type SendMailResult = { type: 'now' } | { type: 'reserve'; date: Date };

const result = await overlay.openAsync<null | SendMailResult>(({ close, isOpen }) => (
  <SendMailDialog close={close} isOpen={isOpen} />
));
```

Dialog 내부에서 `type === 'reserve'`라면 유효한 `date`를 확인한 뒤 `{ type, date }`를 반환하고, 즉시 발송이면 `{ type: 'now' }`를 반환한다.

## Toast와 mutation

- 일반 사용자 피드백은 `useToast`를 사용한다.
- 해당 앱에 `useToastedMutation`이 있고 성공·실패 메시지 계약이 맞으면 이를 우선 검토한다.
- wrapper 사용 때문에 오류별 복구나 후속 동작이 숨겨지면 일반 mutation과 명시적인 피드백을 사용한다.
- `useLoading` 같은 helper는 promise 수명과 버튼 loading 수명이 일치할 때 사용한다.

## 아이콘과 다크 모드

- 기존 화면과 시각 언어가 맞으면 `react-icons/md`, `react-icons/io` 계열을 우선 탐색하되, 의미와 형태가 더 적합한 다른 세트를 금지하지 않는다.
- dark mode selector는 각 앱의 `styles/index.css`에 선언된 현재 variant를 따른다. selector를 문서에서 추측하지 않는다.

## 검증

- Light·dark theme, focus, keyboard 조작, disabled·loading 상태를 확인한다.
- Dialog를 확인·취소·외부 클릭·Escape로 닫았을 때 결과와 정리가 올바른지 확인한다.
- 새로운 token이나 primitive를 추가했다면 소비 앱과 CSS 산출물을 확인한다.