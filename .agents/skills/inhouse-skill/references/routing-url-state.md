# 라우팅과 URL 상태

## 적용 범위

TanStack Router 라우트 파일, URL 이동, search params, loader, `beforeLoad`, 라우트 생성 파일을 변경할 때 적용한다. 상태 소유권은 `react-state-effects.md`, shell·remote 결합은 `module-federation.md`를 함께 읽는다.

## 필수 규칙

- URL 이동과 search params 변경에는 TanStack Router의 `Link`, `useNavigate`, `Route.useSearch`, `useSearch`, `useParams`와 프로젝트 `useSearchState`를 사용한다. 브라우저 history를 직접 조작하지 않는다.
- 라우트가 받는 search params는 `validateSearch`의 Zod 스키마로 검증한다. URL은 외부 입력이므로 타입 단언만으로 신뢰하지 않는다.
- 새로고침·공유 URL·뒤로가기에 보존되어야 하는 탭, 검색어, 필터, 페이지는 URL을 단일 원천으로 둔다.
- URL 값과 지역 state를 `useEffect`로 양방향 동기화하지 않는다.
- 자동 생성 파일인 `apps/*/src/routeTree.gen.ts`는 직접 수정하지 않는다.

## 라우트 파일 규칙

- `~index.tsx`: 현재 경로의 기본 페이지
- `~route.tsx`: 하위 라우트를 감싸는 레이아웃 라우트
- `~_name.tsx`: URL segment를 만들지 않는 pathless 레이아웃
- 한 라우트에서만 쓰는 컴포넌트, 훅, Context, 유틸은 해당 라우트 아래에 둔다.
- 앱 전체가 쓰는 도메인 합성 컴포넌트는 앱의 `src/components`에 둔다.

## search params 구현

- 기존 라우트에 `useSearchState`가 있으면 search params를 state처럼 갱신할 때 우선 사용한다.
- 단순 조회만 필요하면 `Route.useSearch()`가 더 직접적이다.
- 필터 변경과 페이지 초기화처럼 하나의 사용자 액션이 여러 값을 함께 바꾸면 하나의 함수형 update로 원자적으로 갱신한다.

```tsx
const [search, setSearch] = useSearchState({ from: '/_auth/recruit/applicants/' });

const handlePartChange = (partId: number) => {
  setSearch((previous) => ({ ...previous, page: undefined, partId }));
};
```

검색 입력을 지연해야 하면 URL 값을 원천으로 유지하고 query 입력에 `useDelayedValue`를 적용한다. 지역 입력 버퍼가 필요한 제품 요구가 있으면 URL과 다른 수명을 갖는 이유와 확정 시점을 명시하고, Effect로 두 상태를 상시 복제하지 않는다.

```tsx
const [search, setSearch] = useSearchState({ from: '/_auth/recruit/applicants/' });
const delayedKeyword = useDelayedValue(search.search ?? "");
```

## 스키마와 공개 URL 계약

- enum·리터럴 같은 도메인 Zod 스키마를 재사용한다.
- 잘못된 외부 값에 기본값을 적용해야 하면 `.catch(...)`, 값이 없을 때만 기본값이 필요하면 `.default(...)`처럼 실패 의미에 맞는 Zod API를 사용한다.
- 새 search param은 이름만으로 의미가 드러나는 범위에서 간결하게 짓는다.
- 기존 `t`, `ct`, `pid`, `tid` 같은 축약 키는 이미 공유된 URL 계약일 수 있다. 관련 없는 작업에서 이름을 정리하지 않고, 변경이 필요하면 호환성과 migration을 별도 작업으로 다룬다.

## loader와 beforeLoad

- 진입 전에 필요한 서버 데이터는 route loader에서 query options를 통해 prefetch할 수 있다.
- 인증 진입 차단은 shell의 `beforeLoad`가 소유한다. remote가 인증 guard를 복제하지 않는다.
- 기본 하위 경로 이동은 route의 `beforeLoad`와 `redirect`를 사용한다.
- loader와 컴포넌트가 같은 endpoint·query key를 각각 정의하지 않고 같은 query options를 소비한다.

## 생성 파일과 build

별도 route 생성 명령을 추측하지 않는다. 라우트 파일을 변경한 뒤 대상 앱 build로 route tree와 타입 계약을 생성·검증한다. build가 갱신한 `routeTree.gen.ts`는 라우트 변경에서 파생된 결과인지 diff로 확인하고 함께 다룬다. 직접 편집하거나 생성된 변경이라는 이유만으로 임의로 되돌리지 않는다.

```bash
.agents/skills/inhouse-skill/scripts/validate-workspace.sh \
  @yourssu-inhouse/scouter --build
```

## 검증

- 새로고침, 뒤로가기, 앞으로가기에서 URL과 화면 상태가 일치하는지 확인한다.
- 잘못된 search param, param 없음, 기본값을 각각 확인한다.
- 필터 변경 시 페이지 같은 종속 상태가 같은 update에서 초기화되는지 확인한다.
- route 변경 후 대상 앱 build와 생성 파일 diff를 확인한다.
- shell 아래의 최종 URL과 remote preview 양쪽에서 필요한 경로가 열리는지 확인한다.