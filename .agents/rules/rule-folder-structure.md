---
trigger: model_decision
description: 새로운 기능의 폴더 구조를 고려하거나, 특정 파일이 어느 위치에 들어가야 할지 묻거나, 프로젝트 전체의 디렉토리 아키텍처 맥락이 필요할 때 읽어야 합니다.
globs: ./**/*.{ts,tsx,json,js}
---

# Folder Structure Architecture (폴더 구조 규칙)

이 문서는 프로젝트의 루트 레벨 및 앱 `src` 내부, 그리고 단일 기능(Feature) 내부의 디렉토리 구조 룰을 명시합니다. 파일을 새로 만들거나 폴더를 구성할 때 이 규칙을 참조하세요.

## 0. 모노레포 전체 구조 (pnpm + turbo + Module Federation)

이 레포는 **pnpm 워크스페이스 + turbo** 기반 모노레포이며, **Module Federation**으로 하나의 shell(host) 앱이 여러 remote 앱을 통합해 렌더링합니다.

```text
inhouse-client/
├── apps/                       # 배포 단위 앱 (각각 자체 src/, @/ alias, vite/turbo config 보유)
│   ├── shell/                  # MF host — remote 플러그인들을 composePlugins로 통합, 인증/레이아웃 크롬 소유
│   ├── inhouse/                # remote 앱 (인하우스 어드민, basePath /members, port 5175)
│   └── scouter/                # remote 앱 (스카우터, basePath /recruit, port 5174)
├── packages/                   # 워크스페이스 공용 패키지 (@yourssu-inhouse/*)
│   ├── auth/                   # 인증 API 클라이언트 팩토리·쿠키 토큰 저장소·requireAuth 가드·AuthProvider/Login
│   ├── exterior/               # 앱 셸 부트스트랩(createExteriorApp, AppProviders, createQueryClient) + ./layout(PageLayout, Sidebar…)
│   ├── interior/               # 디자인 시스템 UI 컴포넌트(Button, Dialog, Table, Badge, Toast…) + hooks(useToast)
│   ├── interior-vars/          # 디자인 토큰 원천(color/shadow/typography/radius/transition/zIndex CSS 변수)
│   ├── interior-tailwind/      # Tailwind v4 플러그인(./plugin) + cn/tv 유틸(./utils)
│   ├── inhouse-react/          # 공용 React 훅 ./hooks(useSetStateSelector, useDelayedValue, useEffectOnce)
│   ├── inhouse-utils/          # 공용 순수 유틸 서브패스 ./date, ./type, ./misc, ./object, ./ky
│   ├── resources/              # 공용 정적 에셋(로고 PNG, lottie JSON)
│   ├── mfa-core/               # MF 계약 계층(MfaConfig 타입, defineRemotePlugin, SHARED_DEPS, 상수)
│   ├── mfa-vite/               # MF vite 플러그인(mfaVitePlugin.shell/remote)
│   ├── mfa-shell/              # host용 런타임 오케스트레이터(bootstrapShell, composePlugins, graft)
│   ├── eslint-config/          # 공유 ESLint flat config(./base, ./react)
│   └── typescript-config/      # 공유 tsconfig 베이스(./base, ./node)
├── mfa.config.ts               # MF 설정의 단일 출처 — remotes:[{id,port}]
├── turbo.json                  # turbo 파이프라인(빌드 순서의 유일 출처)
├── pnpm-workspace.yaml         # 워크스페이스 매핑 + catalog 버전 고정
└── package.json                # 루트 스크립트(turbo run check:type / fix:lint / fix:format)
```

> **핵심 원칙**: 앱(`apps/*`)끼리는 서로 직접 의존하지 않습니다. 공통으로 쓰는 코드는 반드시 `packages/*`의 워크스페이스 패키지(`@yourssu-inhouse/...`)로 분리하고, 각 앱은 자신의 `src/` 안에서만 `@/` alias를 사용합니다. 새 remote를 추가하려면 `mfa.config.ts`에 한 줄 + `turbo.json`의 `shell#build.dependsOn`에 한 줄만 추가하면 됩니다(expose 키 `./plugin`, `remoteEntry.js`, 플러그인 소스 `./src/plugin.ts`는 `mfa-core`의 고정 계약 상수).

## 1. 루트 폴더 구조

| 디렉토리/파일         | 역할                                                                             |
| --------------------- | -------------------------------------------------------------------------------- |
| `.agents/`            | AI 에이전트용 규칙(`rules/`)과 스킬(`skills/`)을 저장하는 폴더                   |
| `.claude/`            | Claude Code용 설정 및 심링크(`.agents/rules`를 가리키는 심링크로 rules 공유)     |
| `.github/`            | PR 템플릿, auto-assign 등 GitHub 자동화 설정                                     |
| `.vscode/`            | VSCode 에디터 설정 파일 (추천 확장, snippets 등)                                 |
| `apps/`               | **배포 단위 앱**들이 위치하는 폴더 (shell, inhouse, scouter)                     |
| `packages/`           | **공용 워크스페이스 패키지**들이 위치하는 폴더 (`@yourssu-inhouse/*`)            |
| `references/`         | 레퍼런스/문서 자료                                                               |
| `mfa.config.ts`       | Module Federation 설정 (remotes 정의의 단일 출처)                                |
| `turbo.json`          | turbo 파이프라인 정의 (빌드 순서의 유일 출처)                                    |
| `pnpm-workspace.yaml` | 워크스페이스 패키지 매핑 + catalog 버전 고정                                     |
| `package.json`        | 루트 의존성 및 `turbo run` 기반 스크립트(`check:type`, `fix:lint`, `fix:format`) |
| `tsconfig.*.json`     | 루트 TypeScript 베이스 (앱별 config는 `apps/*/tsconfig*.json`이 상속)            |

## 2. 앱 내부 `src` 폴더 구조 (`apps/<app>/src/`)

각 앱(`apps/inhouse`, `apps/scouter`, `apps/shell`)은 자체 `src/`를 가지며, 그 하위는 역할과 문맥(Context)에 따라 관심사가 분리됩니다. `@/` alias는 **해당 앱의 `src/`**를 가리킵니다.

| 디렉토리/파일 | 역할                                                                                                                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apis/`       | 백엔드 통신 로직. 도메인별 폴더에 `index.ts`(Fetcher), `schema.ts`(Zod 스키마/타입), `query.ts`(React Query 옵션). 최상단 `api.ts`는 앱 전역 ky 싱글톤                                               |
| `bootstrap/`  | 앱 실행(부트스트래핑) 관련 초기 셋업 코드 (보통 `packages/exterior`의 `createExteriorApp`로 대체되므로 optional)                                                                                     |
| `components/` | **해당 앱 전용** 합성 컴포넌트들(도메인 특화 다이얼로그·에디터 등). 공용 UI 프리미티브는 `@yourssu-inhouse/interior`에서 import                                                                      |
| `config.ts`   | 환경 변수 및 전역 상수 맵핑 (`apiBaseURL`, `googleOAuthURL` 등)                                                                                                                                      |
| `hooks/`      | **해당 앱 전용** React Custom Hooks (`useSearchState`, `useToastedMutation`, `useAlertDialog`, `useTabDialog`). 범용 훅은 `@yourssu-inhouse/inhouse-react/hooks`                                     |
| `main.tsx`    | Vite/미리보기 진입점 — remote는 `createRemotePreviewApp`, shell은 `bootstrapShell` 호출                                                                                                              |
| `plugin.ts`   | **remote 앱만** — `defineRemotePlugin({ name, routes:{basePath, entry:'/_auth', routeTree}, lifecycle })` 매니페스트                                                                                 |
| `mocks/`      | (inhouse만) MSW 핸들러 — `lifecycle.mocks`로 노출되고 shell이 단일 중앙 worker로 통합                                                                                                                |
| `routes/`     | TanStack Router 파일 기반 라우팅 폴더 (`~` 접두사 사용, `routeTree.gen.ts`는 앱별 자동 생성·수동 수정 금지)                                                                                          |
| `styles/`     | 전역 CSS(`index.css`) 및 앱 한정 스타일. 디자인 토큰은 `interior-vars`/`interior`에서 공급                                                                                                           |
| `types/`      | API 스키마가 **아닌** 해당 앱 전용 유틸리티 타입, 한국어/영문 매핑 상수 등 **UI/display 레이어** 전용 항목. 범용 유틸리티 타입(`Prettify`/`Merge`/`ValueOf`)은 `@yourssu-inhouse/inhouse-utils/type` |
| `utils/`      | 순수 함수, 포매터 함수 등 **해당 앱 전용** 유틸리티. 범용 유틸(날짜 `formatTemplates` 등)은 `@yourssu-inhouse/inhouse-utils`                                                                         |

### `apis/(domain)/` 내부 구조

```text
apis/
├── api.ts                    # ky 인스턴스 (api, nativeApi) — @yourssu-inhouse/auth의 createAuthApiClient로 생성
└── (domain)/                 # 도메인별 폴더 (members, applicants, mails 등)
    ├── index.ts              # Fetcher 함수 (엔드포인트 호출, Schema.parse 검증)
    ├── schema.ts             # Zod 스키마, z.enum 원본 배열, z.infer 타입 alias
    └── query.ts              # React Query 옵션 (queryOptions, infiniteQueryOptions)
```

> **참조 레이어**: `apis/`는 `types/`보다 상위 레이어입니다. `types/`에서 `apis/*/schema`의 타입을 import하여 확장/활용할 수 있습니다.

> **공용 vs 앱 전용 기준**: 여러 앱에서 쓰이면 `packages/*`로, 한 앱에서만 쓰이면 해당 앱의 `src/`에 둡니다. `dist` 산출물을 갖는 패키지(`interior`, `exterior`, `interior-vars`, `mfa-core`, `mfa-vite`)는 소스를 고치면 `tsdown` 재빌드가 필요할 수 있어요.

## 3. 단일 폴더 내부 구조 (Feature Colocation Pattern)

복잡한 UI 컴포넌트나 라우팅 페이지 내부를 캡슐화하기 위해 사용되는 패턴입니다. 해당 기능 안에서만 필요한 로직은 밖으로 빼내지 않고 응집시킵니다.

다음은 단일 기능(예: `TemplateEditorDialog` 또는 특정 라우팅 폴더) 내부의 전형적인 **트리 구조**와 각각의 역할입니다.

```text
FeatureFolder/
├── index.tsx (또는 ~index.tsx / ~route.tsx)  # 모듈 진입점 (메인 뷰)
├── type.ts (선택)                           # 모듈 내에서 공유되는 타입 정의
├── context.ts (선택)                        # 전역 상태 대신 모듈 내부 하위 컴포넌트들이 공유할 Context API
├── components/                              # 외부에서 참조하지 않는, 오직 이 뷰만을 위한 하위 UI 조각들
│   ├── ChildUIOne.tsx
│   └── ChildUITwo.tsx
├── hooks/                                   # 이 뷰에서만 사용되는 비즈니스 로직(Custom Hook) 분리
│   └── useSpecificLogic.ts
└── utils/                                   # UI 렌더링에 종속되지 않은, 모듈 한정 순수 함수 및 데이터 가공 로직
    └── formatSpecificData.ts
```

이와 같은 구조를 통해 파일 크기가 비대해지는 것을 방지하고, 관련된 코드들을 가까운 곳에 모아 응집성과 유지보수성을 극대화합니다(Colocation 원칙). 라우트 폴더의 경우 `apps/scouter/src/routes/~_auth/~recruit/~applicants/{components,hooks}/` 처럼 라우트 서브트리 아래에 `components/`, `hooks/`를 형제로 두는 형태로 실제 적용되어 있습니다.
