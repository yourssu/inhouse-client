---
trigger: model_decision
description: 새로운 페이지를 추가하거나, 라우팅(URL)을 변경하거나, 피쳐 폴더를 설계할 때 읽어야 합니다.
globs: src/routes/**/*.{ts,tsx}
---

# Routing Rules (라우팅 및 피쳐 구조 설계)

> 💡 **Tip:** TanStack Router 등의 동작 방식이나 API에 대해 더 자세한 내용이 필요하다면 **Context7 MCP** 서버를 통해 공식 문서를 질의하여 참고하셔도 됩니다.

프로젝트 내 페이지(Route)를 구성할 때는 `@tanstack/react-router`의 파일 기반 방식인 `~` 접두사 패턴을 따릅니다. 페이지 진입점부터 컴포넌트 하위 분리 방식, 라우팅 변경 원칙 등을 준수해야 합니다.

## 1. 파일 이름 규칙 기반 라우팅

- 파일이나 폴더에 `~`를 붙이면 실제 URL 라우팅 패스로 인식됩니다. 예: `src/routes/~_auth/~recruit/~schedules/~new/~index.tsx`
- 레이아웃(디자인 통일, Auth 처리 등) 라우트의 경우 `~_폴더명.tsx` (URL 변경 X) 처럼 사용할 수 있습니다. (`_auth.tsx`)
- TanStack Router의 설정(`tsr.config.json` 등)을 통해 자동으로 생성되는 파일인 `src/routeTree.gen.ts`는 **절대로 수동으로 수정하지 마세요**.

## 2. URL 파라미터 및 쿼리 파라미터 (Search Params)

- Router에서 제공하는 Hook(`useSearch`, `useParams`, `useNavigate`)을 적극적으로 활용합니다.
- `url` 조작 시 컴포넌트 내부에서 `pushState` 등을 사용하기보다 항상 TanStack Router의 정해진 `Link` 컴포넌트 및 `useNavigate`를 거치도록 하세요.

## 3. 피쳐/페이지 단위의 모듈화 전략 (Co-location)

라우팅되는 페이지가 복잡해질 경우, 그 페이지 내부에서만 사용되는 요소는 밖으로(전역) 빼지 않고 라우트 폴더 내부에 하위 폴더로 배치(Colocation)하십시오.

**권장되는 피쳐 폴더 구조:**

```
src/routes/~_auth/~recruit/~schedules/~new/
├── ~index.tsx       // 페이지 엔트리 파일 (export const Route = createFileRoute(...) 포함)
├── components/      // 해당 페이지 내에서만 쓰이는 하위 UI 컴포넌트들
│   └── ScheduleCreationView.tsx
├── context.ts       // 해당 페이지 전용 상태/비즈니스 로직 Context
└── utils/         // 기타 유틸(optional)
```

## 4. 페이지 진입 전 데이터 프리패칭 또는 리다이렉션

라우터 설정 내 `beforeLoad` 메서드를 이용해 사전에 데이터를 받아오거나(`usePrefetchQuery()`) 로그인 여부에 따른 리다이렉트(`redirect()`)를 처리하는 것이 가능합니다.

## 5. `~route.tsx` 와 `~index.tsx` 의 차이점

- `~route.tsx`: 현재 폴더를 **레이아웃 라우트**로 만들 때 사용합니다. 자신과 하위 라우트들에게 공통적인 레이아웃(UI) 상태를 적용하며, `<Outlet />`을 통해 하위 페이지를 렌더링합니다.
- `~index.tsx`: 현재 경로의 **기본(Index) 페이지**입니다. 폴더의 주소로 직접 접근했을 때 실제로 렌더링되는 진입점 컴포넌트 역할을 합니다.

## 6. Search Params (`validateSearch`) 작성 규칙

URL의 길이를 최소화하기 위해 Query Parameter(URL Search Params)의 필드명은 **최대한 짧게** 가져갑니다. 단, 다른 개발자가 의미를 알 수 있도록 **반드시 주석으로 어떤 필드인지 맥락을 적어줍니다.**

```tsx
// 예시: src/routes/~_auth/~recruit/~schedules/~index.tsx
validateSearch: z.object({
  ct: z.enum(['월별', '주별']).optional().default('월별'), // 캘린더 타입
  pid: z.number().optional(), // 파트 필터 id
}),
```
