---
trigger: model_decision
description: 새로운 기능의 폴더 구조를 고려하거나, 특정 파일이 어느 위치에 들어가야 할지 묻거나, 프로젝트 전체의 디렉토리 아키텍처 맥락이 필요할 때 읽어야 합니다.
globs: ./**/*.{ts,tsx,json,js}
---

# Folder Structure Architecture (폴더 구조 규칙)

이 문서는 프로젝트의 루트 레벨 및 `src` 내부, 그리고 단일 기능(Feature) 내부의 디렉토리 구조 룰을 명시합니다. 파일을 새로 만들거나 폴더를 구성할 때 이 규칙을 참조하세요.

## 1. 루트 폴더 구조

프로젝트 루트 레벨의 주요 파일과 폴더의 역할은 다음과 같습니다.

| 디렉토리/파일      | 역할                                                              |
| ------------------ | ----------------------------------------------------------------- |
| `.agent/`          | AI 에이전트(모델)를 위한 규칙(Rules)과 워크플로우를 저장하는 폴더 |
| `.tanstack/`       | TanStack Router 관련 임시/캐시 파일                               |
| `.vscode/`         | VSCode 에디터 설정 파일 (추천 확장, snippets 등)                  |
| `public/`          | 정적 에셋 (이미지, 폰트, favicon 등), 빌드 시 그대로 복사됨       |
| `scripts/`         | 프로젝트 빌드나 배포, 환경 설정 등에 사용되는 커스텀 스크립트     |
| `src/`             | **실제 애플리케이션의 소스 코드**가 위치하는 폴더                 |
| `eslint.config.js` | ESLint 설정 (코드 린팅 룰)                                        |
| `vite.config.ts`   | Vite 번들러 체계 및 플러그인 설정                                 |
| `package.json`     | 프로젝트 의존성 라이브러리 및 스크립트 명령어 관리                |
| `tsconfig.*.json`  | TypeScript 컴파일러 설정 파일들                                   |

## 2. `src` 내부 폴더 구조

`src` 하위는 역할과 문맥(Context)에 따라 관심사가 분리됩니다.

| 디렉토리/파일 | 역할                                                                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| `apis/`       | 백엔드 통신 로직. 도메인별 폴더에 `index.ts`(Fetcher), `schema.ts`(Zod 스키마/타입), `query.ts`(React Query 옵션) |
| `bootstrap/`  | 앱 실행(부트스트래핑) 관련 초기 셋업 코드 (Router 생성, Providers 등)                                             |
| `components/` | 전역으로 사용되는 UI 및 공통 컴포넌트들 (`_ui`: 코어 디자인 요소)                                                 |
| `config.ts`   | 환경 변수 및 전역 상수 맵핑                                                                                       |
| `hooks/`      | 프로젝트 전역에서 재사용되는 React Custom Hooks                                                                   |
| `main.tsx`    | 애플리케이션의 진입점(Entry Point), React DOM 렌더링                                                              |
| `routes/`     | TanStack Router의 파일 기반 라우팅 폴더 (`~` 접두사 사용)                                                         |
| `styles/`     | 전역 CSS 및 Tailwind 변수 등 스타일 관련 설정                                                                     |
| `types/`      | API 스키마가 **아닌** 전역 유틸리티 타입, 한국어/영문 매핑 상수, 색상 매핑 등 **UI/display 레이어** 전용 항목     |
| `utils/`      | 순수 함수, 포매터 함수 등 전역 유틸리티 모음                                                                      |

### `apis/(domain)/` 내부 구조

```text
apis/
├── api.ts                    # ky 인스턴스 (api, nativeApi) 정의
└── (domain)/                 # 도메인별 폴더 (members, applicants, mails 등)
    ├── index.ts              # Fetcher 함수 (엔드포인트 호출, Schema.parse 검증)
    ├── schema.ts             # Zod 스키마, z.enum 원본 배열, z.infer 타입 alias
    └── query.ts              # React Query 옵션 (queryOptions, infiniteQueryOptions)
```

> **참조 레이어**: `apis/`는 `types/`보다 상위 레이어입니다. `types/`에서 `apis/*/schema`의 타입을 import하여 확장/활용할 수 있습니다.

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

이와 같은 구조를 통해 파일 크기가 비대해지는 것을 방지하고, 관련된 코드들을 가까운 곳에 모아 응집성과 유지보수성을 극대화합니다(Colocation 원칙).
