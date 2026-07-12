# React 상태와 Effect

## 적용 범위

지역 상태, URL 상태, Context, Provider, 파생 상태, `useEffect`, 비동기 UI 상태를 설계할 때 적용한다. URL 구현을 변경하면 `routing-url-state.md`를 함께 읽는다.

## 필수 규칙

- `useEffect`는 렌더링 결과를 React 외부 시스템과 동기화할 때 사용한다. props·state로 계산할 수 있는 값을 다시 state에 복제하지 않는다.
- API 데이터를 가져와 지역 state에 복사하는 용도로 `useEffect`를 사용하지 않는다. TanStack Query와 `server-data.md`의 패턴을 사용한다.
- 인증 여부 확인과 진입 차단은 컴포넌트 Effect가 아니라 라우트 가드에서 처리한다.
- 사용자의 한 번의 액션으로 발생하는 상태 변경과 부수 효과는 가능한 한 같은 이벤트 흐름에서 실행한다.
- Context 소비 혹은 Provider 밖에서 사용될 때 조용히 잘못된 기본값을 반환하지 않고 명확히 실패해야 한다.

## 상태 위치 기본 선택

다음 순서로 가장 좋은 소유자를 선택한다.

1. 한 컴포넌트 안에서만 쓰면 지역 state 또는 reducer
2. 새로고침·공유 URL·뒤로가기에 보존되어야 하는 탭, 검색, 필터면 URL search params
3. 서버에서 온 데이터면 TanStack Query
4. 한 기능 트리의 여러 하위 컴포넌트가 같은 상태와 액션을 공유하면 Context

URL에 노출할 필요가 없는 일시적인 입력·열림 상태까지 search params로 올리지 않는다. 콜백 전달이 짧고 명확하면 Context보다 props를 사용한다.

## Context와 Provider

- Context 타입은 하나의 명확한 기능 맥락을 표현한다.
- Context 선언과 소비 혹은 기능 폴더의 `context.ts`에 둘 수 있다. 상태 구현까지 반드시 같은 파일에 둘 필요는 없다.
- 기본값은 `null` 또는 `undefined` 중 주변 코드와 타입에 맞는 값을 사용하고, 소비 훅에서 `if`·`assert` 등으로 invariant를 확인한다.
- feature 전용 상태는 실제 화면이나 기능 진입 컴포넌트에서 소유하고 `<Context.Provider>`로 주입하는 방식을 기본으로 한다.
- 상태 초기화와 액션을 감추기 위해 feature 전용 Provider wrapper를 습관적으로 만들지 않는다. 호출자가 상태 수명과 초기화 시점을 알기 어려워질 수 있다.

다음 Provider는 별도 컴포넌트로 격리하는 편이 적합하다.

- Auth, Theme, Toast, QueryClient처럼 앱 전역 초기화와 자원 수명을 소유한다.
- 여러 진입점에서 같은 초기화 계약을 재사용한다.
- Provider 자체가 외부 시스템 연결, 정리 또는 오류 경계를 책임진다.

feature 상태는 실제 진입 컴포넌트가 소유하고 필요한 하위 트리에 직접 주입한다.

```tsx
export const ApplicantsPage = () => {
  const selection = useMultiSelectActions<number>();

  return (
    <ApplicantSelectionContext.Provider value={selection}>
      <ApplicantsTable />
      <ApplicantSelectionBar />
    </ApplicantSelectionContext.Provider>
  );
};
```

Context 선언과 소비 훅은 별도 `context.ts`에 두되, feature 상태 초기화를 숨기는 `ApplicantSelectionProvider` wrapper를 새로 만들지 않는다.

## 객체 state의 필드 setter

객체 state의 독립적인 필드를 갱신할 때는 `@yourssu-inhouse/inhouse-react/hooks`의 `useSetStateSelector`를 사용할 수 있다. 앱에 같은 이름의 로컬 복사본이 있어도 공용 package를 우선한다. 같은 컴포넌트에서 selector setter가 여러 개 필요하면 각각 `setField` 변수로 늘어놓지 말고 state 필드명과 같은 key를 가진 `setters` 객체로 모아 선언한다. 관련 setter를 한곳에서 찾을 수 있고 호출부에서도 어떤 필드를 변경하는지 바로 드러난다.

```tsx
const [state, setState] = useState({
  isOpen: false,
  keyword: '',
  selectedIds: [] as number[],
});

const setters = {
  isOpen: useSetStateSelector(setState, 'isOpen'),
  keyword: useSetStateSelector(setState, 'keyword'),
  selectedIds: useSetStateSelector(setState, 'selectedIds'),
};

setters.keyword('지원자');
setters.selectedIds((prev) => [...prev, applicantId]);
```

- selector setter가 하나뿐이면 `setKeyword`처럼 역할이 드러나는 변수로 직접 선언해도 된다.
- 이전 필드 값에 의존하면 selector setter의 함수형 업데이트를 사용한다.
- `setters` 객체는 지역 코드 정리를 위한 묶음이다. 객체 자체는 렌더링마다 새로 만들어지므로 Context 값이나 참조 안정성이 필요한 Props로 그대로 전달하지 말고 필요한 setter만 전달한다. 같은 이유로 객체 전체를 `useCallback`·`useMemo` 의존성으로 사용하지 않는다.
- 한 사용자 액션이 여러 필드를 함께 바꾸며 불변식을 유지해야 한다면 selector setter를 연속 호출하지 않는다. 하나의 함수형 `setState` 또는 reducer action으로 원인과 결과를 한곳에 두고 원자적으로 갱신한다.
- URL search params의 여러 필드를 함께 바꿀 때도 같은 원칙을 적용하고 `routing-url-state.md`의 함수형 update를 사용한다.

## Effect를 대체하는 기본 패턴

- 파생 값: 렌더링 중 계산하고 실제로 비싼 계산만 `useMemo`를 고려한다.
- prop 변경 시 전체 상태 초기화: 컴포넌트 수명을 새로 시작하는 것이 의도라면 의미 있는 `key`를 사용한다.
- 이벤트 후 API·오버레이 실행: 해당 이벤트 핸들러에서 실행한다.
- 검색 입력 지연: 제품 요구와 호출 비용이 있을 때 `useDelayedValue`를 사용한다.

props와 state에서 얻을 수 있는 값은 렌더링 중 계산한다.

```tsx
const activeMembers = members.filter((member) => member.state === '활동');
```

사용자 액션으로 발생하는 상태 변경과 부수 효과는 같은 이벤트 흐름에 둔다.

```tsx
const handleConfirm = async () => {
  await updateMember(input);
  toast.success('저장했어요.');
  close();
};
```

위 작업을 `useEffect`가 상태 변화를 감지해 실행하도록 우회하지 않는다.

## Effect가 적합한 경우

- DOM·에디터·브라우저 API·타이머·구독 같은 외부 시스템 연결과 정리
- 현재 시간을 주기적으로 갱신하거나 스크롤 위치를 맞추는 등 시간·레이아웃과의 동기화
- React가 소유하지 않는 객체의 명령형 상태를 props와 맞추는 작업

Effect를 사용할 때 setup과 cleanup, 재실행 조건, stale closure 가능성을 한 위치에서 확인할 수 있게 한다.

## 검증

- 상태를 숨긴 뒤 새로고침, 뒤로가기, 컴포넌트 remount에서 의도한 값이 유지·초기화되는지 확인한다.
- Effect 변경 후 cleanup과 중복 실행을 확인한다.
- Context 변경 후 Provider 밖 사용과 초기화 순서를 확인한다.