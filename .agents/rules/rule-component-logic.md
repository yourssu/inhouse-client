---
trigger: model_decision
description: 컴포넌트 내부의 로직(상태 업데이트, 렌더링 최적화, 조건부 렌더링, 컴포넌트 확장 등)을 작성할 때 읽어야 합니다. 컴포넌트를 새로 작성하는 경우는 rule-component-structure 이후에 실행되어야 하는 규칙입니다.
---

# Component Logic Rules (컴포넌트 로직 작성 규칙)

`rule-component-structure` 규칙에 이어 컴포넌트 내부의 상태 관리, 렌더링 최적화, 확장 등 공통적으로 준수해야 하는 로직 작성 패턴입니다.
또한, React 공식 패턴에 따라 **`useEffect`를 최대한 지양해야 합니다.** 복잡도를 낮추고 렌더링 최적화를 달성하려면 반드시 `rule-no-useeffect.md` 규칙을 함께 참고하세요!

## 1. 상태 업데이트 로직 그룹화 패턴 (`useSetStateSelector`)

복잡한 객체 상태(Context, Search Params 등)의 특정 필드만 업데이트해야 할 때, 인라인으로 일일이 업데이트 로직을 작성하지 않고 `setters`라는 객체로 묶어서 관리합니다.

- 객체 형식의 상태를 다룰 때는 렌더링 부에 인라인 함수(`(v) => setState({...})`)를 남발하기보단, 컴포넌트 상단에 `setters` 객체를 만들고 `useSetStateSelector` 커스텀 훅을 활용하여 각 필드의 setter를 선언적으로 모아서 정의하도록 구성합니다.

```tsx
// 단일 변경만 필요한 경우
const setKeyword = useSetStateSelector(setSearch, 'keyword');

// 여러개가 필요한 경우 객체로 묶기
const setters = {
  mid: useSetStateSelector(setSearch, 'mid'),
  page: useSetStateSelector(setSearch, 'page'),
  state: useSetStateSelector(setContext, 'member.state'),
};

// 사용처 예시
<Pagination onPageChange={(page) => setters.page(page)} />;
```

## 2. 선언적 조건부 렌더링 (`SwitchCase`)

상태나 타입(Union Type)에 따라 렌더링해야 할 UI 덩어리가 완전히 달라질 때 삼항 연산자(Ternary operator) 중첩이나 복잡한 `if / else`를 피하는 패턴입니다.

- `if` 문이나 `&&`, `? :` 체이닝 대신 `react-simplikit`의 `<SwitchCase />` 컴포넌트를 사용해 각 상태(case)에 따른 컴포넌트를 매핑하여 렌더링합니다.
- **예외 케이스 (중첩이 없는 삼항 연산자)**: A 상태일 때 UI 1, 아닐 때 UI 2 처럼 **단순하고 중첩이 없는 2가지 분기의 삼항 연산자**는 직관적으로 이해할 수 있으므로 굳이 `<SwitchCase />`로 리팩토링할 필요가 없습니다. `<SwitchCase />`는 분기 상태가 **3개 이상**일 때부터 도입을 우선 고려하세요.

```tsx
<SwitchCase
  value={context.member.state}
  caseBy={{
    액티브: () => <ActiveForm setValue={setters.액티브} value={context.extended.액티브} />,
    비액티브: () => <InactiveForm setValue={setters.비액티브} value={context.extended.비액티브} />,
    졸업: () => <GraduatedForm />,
    탈퇴: () => null,
  }}
/>
```

## 3. 컴포넌트 확장 및 의존성 역전 패턴 (Render Props)

공통된 베이스 구조를 가지지만, 특정 탭이나 상황에서 컬럼이 추가되거나 각 행의 내용이 달라져야 할 때 쓰이는 패턴입니다.

- 컴포넌트의 다형성이 필요한 경우(예: 리스트 항목의 세부 내용이 달라지는 경우) 공통 베이스 하위 컴포넌트 안에서 `if`로 하드코딩된 분기 처리를 하지 않고, 부모에서 주입받는 `children`을 Render Prop(`(item) => ReactNode`) 형태로 받아 외부(부모)에서 확장 로직을 제어하도록 구성합니다.

```tsx
// ActiveMembersTable.tsx에서 BaseMembersTable 호출 예시
<BaseMembersTable
  extendedColumns={[<Table.Th key="회비 납부">회비 납부</Table.Th>]}
  members={members}
>
  {/* Render Prop */}
  {(member) => (
    <Table.Cell>
      <Badge color={member.membershipFee ? 'green' : 'red'}>
        {member.membershipFee ? '납부' : '미납'}
      </Badge>
    </Table.Cell>
  )}
</BaseMembersTable>
```

## 4. 렌더링 최적화 훅 활용 (`startTransition`, `useDelayedValue`)

필터링이나 검색과 같이 무거운 UI 업데이트가 발생할 때 사용자의 인터랙션(타이핑, 클릭)이 멈추지 않게 방어하는 패턴입니다.

- **검색어 등 연속된 입력값**: 검색 API 호출 등에 쓰이는 검색어 상태는 반드시 `useDelayedValue` 커스텀 훅을 씌워 디바운스/지연 처리를 합니다.
- **필터링 등 무거운 화면 전환**: 리스트 필터링 조건 추가 등으로 넓은 영역의 렌더링(리스트 재조정 등)이 일어나는 setter 호출 부는 React의 `startTransition`으로 감싸 주 사용 스레드(Main Thread)가 블로킹되지 않게 합니다.

```tsx
// 1. 입력값 지연
const { data: members } = useSuspenseQuery({
  // useDelayedValue를 사용해 지연된 검색값으로 쿼리를 수행
  ...activeMembersOption({
    partId: search.partId,
    search: useDelayedValue(searchKeyword),
  }),
});

// 2. 상태 전환 지연
const onPartFilterChange = (v: PartNameKoType) => {
  // 상태 변경을 startTransition으로 감싸 무거운 컴포넌트 전환에 대응
  startTransition(() => {
    setters.partId(part.partId);
    setters.page(undefined);
  });
};
```

## 5. 조건부 렌더링 컴포넌트 호출 패턴 (`null` 리턴 지양)

컴포넌트 내부에서 특정 조건에 따라 렌더링 여부를 결정하고 `null`을 반환하는 방식을 지양합니다. 대신, 해당 컴포넌트를 호출하는 부모(사용처) 쪽에서 애초에 조건부로 렌더링되도록 구현합니다.

- 불필요한 마운트와 상태 평가를 막기 위해 컴포넌트 자체를 호출조차 하지 않는 것이 성능과 로직 파악에 더 좋습니다.

```tsx
// ❌ Don't: 내부에서 직접 판단해서 null 반환
const SubComponent = ({ isVisible }: { isVisible: boolean }) => {
  if (!isVisible) {
    return null;
  }
  return <div>내용</div>;
};

// 렌더링 부에서 무조건 호출함
<SubComponent isVisible={isVisible} />;

// ⭕ Do: 부모에서 호출할 때 렌더링할지 판단
const SubComponent = () => {
  return <div>내용</div>;
};

// 렌더링 부에서 조건이 맞을 때만 렌더링되게 호출함
{
  isVisible && <SubComponent />;
}
```

## 6. 데이터 기반 UI 렌더링 (Content Declarative Pattern)

UI에 표시될 텍스트(title, description 등)가 두 개 이상의 분기 조건에 따라 달라질 때, JSX 내부에 삼항 연산자를 중첩하여 하드코딩하지 않고, 객체 상수(Dictionary) 형태로 콘텐츠를 분리하여 선언적으로 렌더링합니다.

- 컴포넌트 외부 상단에 상수 객체(`as const satisfies ...`)를 선언하여 조건(Key)에 따라 콘텐츠(Value)를 관리합니다.
- 이는 UI 텍스트의 응집도를 높여 텍스트 변경 시 유지보수 범위를 국소화하고, JSX 렌더링 부의 복잡성을 크게 낮춰줍니다.

```tsx
// ❌ Don't: JSX 내부에 복잡한 상태 판별과 텍스트 하드코딩 혼재
<Result
  description={hasContent ? undefined : '또는 템플릿으로 시작해보세요.'}
  title={hasContent ? '받는 사람을 추가해주세요' : '왼쪽 에디터에서 내용을 작성해보세요'}
/>;

// ⭕ Do: 상수 객체로 콘텐츠 분리 후 매핑
const resultContent = {
  noRecepient: {
    title: '받는 사람을 추가해주세요',
  },
  noContent: {
    description: '또는 템플릿으로 시작해보세요.',
    title: '왼쪽 에디터에서 내용을 작성해보세요',
  },
} as const satisfies Record<string, { description?: string; title: string }>;

// 컴포넌트 내부
const resultType = hasContent ? 'noRecepient' : 'noContent';
const resultData = resultContent[resultType] as { description?: string; title: string };

<Result description={resultData.description} title={resultData.title} />;
```
