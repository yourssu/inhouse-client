# React 컴포넌트

## 적용 범위

컴포넌트를 새로 만들거나 분리하고, Props·렌더링 분기·확장 구조·렌더링 성능을 설계할 때 적용한다. 상태와 Effect는 `react-state-effects.md`를 함께 읽는다.

## 필수 규칙

- 컴포넌트 이름과 주 역할이 드러나는 파일·폴더 이름을 사용한다.
- 자동 생성 라우트 컴포넌트가 아니라면 named export를 기본으로 한다.
- 컴포넌트 분리는 동작과 소유권을 보존해야 한다. 단순히 줄 수를 줄이기 위해 상태나 제어 흐름을 먼 파일로 숨기지 않는다.
- hooks 규칙을 지키고 조건부로 hook을 호출하지 않는다.

## 파일과 본문 구조 기본 선택

- 작은 컴포넌트는 한 파일에 둔다.
- 서브 컴포넌트·훅·타입이 함께 이동하고 같은 이유로 변경되면 컴포넌트 이름의 폴더로 묶고 `index.tsx`를 진입점으로 사용할 수 있다.
- 파일은 `타입과 Props -> 컴포넌트 -> 정적 데이터`를 기본 순서로 배치한다. 구분용 주석을 반복해서 넣을 필요는 없다.
- 컴포넌트 본문은 다음 기본 순서를 따른다.
  1. 외부 Context·라우터·공용 훅
  2. 지역 상태와 상태에 가까운 setter
  3. 서버 데이터와 mutation
  4. 파생 값
  5. 이벤트 핸들러
  6. JSX
- 서로 강하게 관련된 값과 로직은 순서 규칙보다 가까이 두는 것을 우선한다.

프로젝트가 지향하는 기본 컴포넌트 형태는 다음과 같다.

```tsx
interface MemberListProps {
  members: Member[];
  title: string;
}

export const MemberList = ({ members, title }: MemberListProps) => {
  const [keyword, setKeyword] = useState("");

  const { data: parts } = useSuspenseQuery(partsOption());

  const filteredMembers = members.filter((member) => member.name.includes(keyword));

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
  };

  return (
    <section aria-label={title}>
      <SearchField onChange={handleKeywordChange} value={keyword} />
      <MemberRows members={filteredMembers} parts={parts} />
    </section>
  );
};
```

이 예시는 `interface` Props, 화살표 함수, named export와 `상태 -> 서버 데이터 -> 파생 값 -> 이벤트 핸들러 -> JSX` 순서를 함께 보여준다. 실제 컴포넌트에서는 사용하지 않는 영역을 억지로 만들지 않는다.

## 분리 판단 기준

다음 중 하나가 성립하면 분리를 고려한다.

- 독립적인 UI 의미와 이름을 가진다.
- 자체 상태·Effect·오류 경계를 가진다.
- 부모의 핵심 흐름을 읽는 데 방해되는 큰 렌더링 덩어리다.
- 실제로 둘 이상의 사용처가 같은 정책과 변경 이유를 공유한다.

라인 수만으로 분리하지 않는다. 한 번만 쓰이는 짧은 표현을 별도 컴포넌트나 헬퍼로 감싸 이동 비용을 늘리지 않는다.

## 렌더링 분기와 확장

- 두 갈래의 단순 분기는 일반 조건식이나 삼항 연산자를 사용한다.
- 상태가 세 개 이상이고 각 상태가 독립적인 큰 UI를 만들 때 `SwitchCase` 같은 데이터 기반 매핑을 고려한다.
- 공통 뼈대와 확장 지점이 여러 사용처에서 실제로 반복될 때 Render Props나 children slot을 고려한다.
- 컴포넌트가 자신의 표시 가능성을 캡슐화해야 하면 내부에서 `null`을 반환할 수 있다. 표시 여부를 부모가 이미 소유한다면 부모에서 조건부 렌더링하는 편이 흐름을 더 잘 드러낸다.
- 표시 순서와 라벨이 제품 데이터라면 객체·배열 선언에 의도를 담고 중첩 조건문을 줄인다.

두 갈래의 짧은 분기는 직접 표현한다.

```tsx
return isEmpty ? <EmptyView /> : <MemberTable />;
```

세 가지 이상의 독립적인 화면 상태를 매핑해야 할 때 `SwitchCase`를 고려한다.

```tsx
<SwitchCase
  value={status}
  caseBy={{
    idle: () => <IdleView />,
    loading: () => <LoadingView />,
    success: () => <SuccessView />,
  }}
/>
```

분기 수만으로 도구를 선택하지 않는다. 각 case가 이름 있는 UI 상태이고 매핑이 중첩 조건보다 읽기 쉬울 때 사용한다.

## 성능 도구 사용 기준

- 검색 API 호출을 줄여야 하고 즉시 반영이 제품 요구가 아닐 때 `useDelayedValue`를 사용한다.
- `startTransition`은 실제로 긴 렌더링을 유발하는 비긴급 상태 변경에만 사용한다. 모든 필터 setter를 기계적으로 감싸지 않는다.
- `useMemo`와 `useCallback`은 계산 비용, 참조 안정성 또는 하위 렌더링 최적화 계약이 있을 때 사용한다.
- 최적화 도구를 추가하기 전에 단순한 데이터 흐름과 불필요한 상태를 먼저 줄인다.

## 검증

- 기존 인터랙션, 접근성 이름, loading·empty·error 상태를 확인한다.
- 컴포넌트 분리 후 Props와 상태 소유자가 더 명확해졌는지 확인한다.
- 성능 최적화는 체감이나 추측이 아니라 렌더링 범위와 호출 빈도로 근거를 확인한다.