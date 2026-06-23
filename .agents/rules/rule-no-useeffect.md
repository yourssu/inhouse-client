---
trigger: model_decision
description: 컴포넌트 내부에서 useEffect를 지양하고 렌더링 최적화를 달성하기 위해 읽어야 합니다.
---

# No useEffect Rules (useEffect 지양 패턴 규칙)

React 개발에서 `useEffect`는 **오직 외부 시스템(External System)과의 동기화를 위해서만** 사용되어야 합니다. 복잡도를 낮추고 렌더링 최적화를 달성하기 위해, 다음 패턴들을 준수하여 `useEffect` 사용을 최대한 피하십시오 (참고: [You Might Not Need an Effect](https://ko.react.dev/learn/you-might-not-need-an-effect)).

## 1. 파생 상태 (Derived State) 계산

`props`나 `state`가 변경될 때 계산된 새로운 값을 얻기 위해 새로운 상태(state)를 만들지 마세요.

- **❌ 안 좋은 패턴**: 목록(items) prop이 바뀔 때마다 `useEffect`를 돌려서 필터링된 배열 상태를 `setState`로 업데이트.
- **✅ 프로젝트 준수 패턴**: **렌더링 도중에 단순히 변수로 계산**합니다. 컴포넌트가 다시 렌더링될 때 자동으로 최신화되므로 연쇄 렌더링을 방지할 수 있습니다. 계산 비용이 매우 크다면 `useMemo`로 감싸 캐싱합니다.

  ```tsx
  // ✅ 렌더링 시점에 즉시 계산
  const { members } = props;
  const activeMembers = members.filter((m) => m.isActive);

  // 비용이 많이 드는 계산이라면 useMemo 사용
  // const activeMembers = useMemo(() => members.filter(m => m.isActive), [members]);
  ```

## 2. 상태 변화에 따른 부수 효과 처리 (Event-Driven Side Effects)

어떤 상태(A)가 바뀔 때 연쇄적으로 백엔드 요청이나 다른 상태(B)를 변경해야 할 때, 그 감지 및 실행 역할을 `useEffect`에 맡기면 흐름을 추적하기 매우 어려워집니다.

- **❌ 안 좋은 패턴**: `status` state가 바뀔 때 `useEffect`에서 `status` 값을 확인하고 축하 모달을 띄우거나 POST API를 요청.
- **✅ 프로젝트 준수 패턴**: 부수 효과(사이드 이펙트)는 상태를 변화시킨 **이벤트 핸들러(onClick, onSubmit 등) 내부에서 즉시 처리**해야 합니다.
  ```tsx
  const handleConfirm = () => {
    setStatus('SUCCESS');
    openDialog('축하합니다!'); // ❌ useEffect에 의존하지 않고 즉시 호출
    mutateAnalytics({ action: 'SUCCESS' }); // ❌ useEffect 없이 mutate를 여기서 바로 호출
  };
  ```

## 3. prop 변경 시 컴포넌트 State 초기화 (Resetting State)

부모로부터 전달받는 고유 `prop`(예: `userId`)이 바뀌었을 때, 자식 내부의 상태(입력 폼 등)를 완전히 초기화하고 싶을 때 쓰이는 패턴입니다.

- **❌ 안 좋은 패턴**: `useEffect`의 의존성 배열에 `userId`를 넣고 값이 바뀌면 `setForm(...)` 빈 값으로 초기화.
- **✅ 프로젝트 준수 패턴**: **React의 `key` 속성**을 활용합니다. 컴포넌트를 호출하는 쪽에서 달라지는 `id`를 `key`로 부여하면, React가 트리에서 기존 컴포넌트를 헐고 새로운 컴포넌트를 마운트하여 상태를 자동으로 초기화시킵니다.
  **주의**: `key`를 사용하여 상태를 초기화할 때는 반드시 **사용처에 주석으로 맥락을 전달**해야 합니다.
  ```tsx
  <UserProfileForm
     {/* userId가 변경될 때마다 폼 상태를 무효화(초기화)하기 위해 key로 지정 */}
     key={userId}
     initialData={...}
  />
  ```

## 4. 데이터 페칭 (Data Fetching)

API 데이터를 가져오고 상태에 담기 위해 `useEffect`를 사용하는 것은 완벽히 금지됩니다. (자세한 내용은 `rule-api-data-fetching.md` 참조)

- **❌ 안 좋은 패턴**: `useEffect` 안에서 데이터를 fetch한 후 `setState`를 호출해 결과 저장.
- **✅ 프로젝트 준수 패턴**: React Query의 **`useSuspenseQuery`** 등을 사용하여 데이터 요구를 선언적으로 작성합니다.

## 5. 페이지 진입 권한 체크 및 리다이렉트

페이지에 진입할 때 로그인 상태를 확인하고 다른 페이지로 보내기 위해 컴포넌트 마운트 시점을 감지해선 안 됩니다. (자세한 내용은 `rule-auth.md` 참조)

- **❌ 안 좋은 패턴**: 컴포넌트 내에서 `useEffect`로 검사하여 토큰이 없으면 리다이렉트.
- **✅ 프로젝트 준수 패턴**: TanStack Router의 **`beforeLoad` 라우트 가드**를 활용하여 라우팅 진입 전에 차단합니다.

## 6. 입력 필드 지연 (Debouncing) 및 렌더링 최적화

검색어와 같은 텍스트 입력을 지연시키기 위해 `useEffect`에 `setTimeout`과 `clearTimeout`을 구현할 필요가 없습니다. (자세한 내용은 `rule-component-logic.md` 참조)

- **❌ 안 좋은 패턴**: `useEffect`의 의존성에 텍스트 값을 넣고 N초 뒤 실행.
- **✅ 프로젝트 준수 패턴**: **`useDelayedValue`** 훅으로 값을 지연시키고 무거운 상태 전환은 **`startTransition`**으로 감쌉니다.
