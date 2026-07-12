---
name: inhouse-skill
description: Yourssu 인하우스 클라이언트 저장소의 프로젝트 컨벤션과 검증 절차를 제공한다. 이 저장소에서 구현, 수정, 리팩터링, 코드 리뷰, 디버깅, 테스트, 구조 설계를 수행할 때 반드시 사용한다. React 컴포넌트, TypeScript 타입, API·TanStack Query·Zod, 인증, 라우팅, 상태 관리, 스타일링, 날짜, 오버레이, 모노레포 설정 중 하나라도 다루는 작은 변경에도 적용한다. 저장소와 무관한 일반 개념 질문이나 단순 대화에는 사용하지 않는다.
---

# 인하우스 프로젝트 규칙

이 저장소의 코드를 다룰 때 작업 영역에 해당하는 참조 문서만 골라 읽고 적용한다.

## 작업 절차

1. 사용자 요청과 수정·검토할 파일의 역할을 먼저 파악한다.
2. 아래 라우팅 표에서 해당하는 참조 문서를 모두 읽는다.
3. 구현을 새로 만들기 전에 `packages/*`의 공개 export에 같은 역할의 구현이 있는지 확인한다.
4. 여러 영역이 겹치면 관련 규칙을 함께 적용한다.
5. 규칙과 실제 코드가 다르면 아래 우선순위로 판단하고, 현재 작업에서 고치지 못한 확정 결함은 `references/follow-up-tasks.md`에 기록한다.
6. 코드를 변경했다면 반환 전에 `references/quality.md`의 검증 범위를 적용한다.

## 판단 우선순위

1. 사용자가 명시한 요구와 보존해야 하는 공개 동작
2. `packages/*`가 공개한 공용 구현과 저장소의 필수 불변식
3. 이 스킬이 정한 프로젝트 기본 선택
4. 대상 기능의 지역적 구현

앱에 같은 구현의 복사본이 있어도 공용 패키지보다 우선하지 않는다. 공용 export와 다른 앱 구현이 공존하면 앱 구현을 새로운 선례로 확장하지 말고 결함 또는 미완료 마이그레이션으로 취급한다.

## 참조 문서 라우팅

| 작업 상황 | 읽을 참조 문서 |
| --- | --- |
| 모노레포 경계, import 경로, 패키지 배치, 기능 폴더를 처리 | `references/project-architecture.md`, `references/workspace-packages.md` |
| Module Federation, shell·remote, plugin, preview, graft, shared dependency, remote CSS를 처리 | `references/module-federation.md`, `references/project-architecture.md` |
| TanStack Router, 라우트 파일, URL·search params, loader·beforeLoad를 처리 | `references/routing-url-state.md`, `references/project-architecture.md` |
| 파일·식별자 이름, 함수 선언, export, TypeScript 타입·단언을 처리 | `references/typescript-conventions.md` |
| 컴포넌트 생성·분리, Props, 렌더링 분기, Render Props, 렌더링 성능을 처리 | `references/react-components.md` |
| 지역·URL·Context 상태, Provider, 파생 상태, `useEffect`를 처리 | `references/react-state-effects.md` |
| API 호출, ky, TanStack Query, mutation, query key, Zod 입출력 스키마를 처리 | `references/server-data.md` |
| 로그인, 토큰, 인증 클라이언트, 권한, 인증 Provider·라우트 가드를 처리 | `references/auth.md` |
| Tailwind CSS, 디자인 토큰, `cn`·`clsx`·`tv`, 공용 UI, Dialog·Toast·overlay를 처리 | `references/ui-system.md` |
| 날짜 파싱, 검증, 계산, 정렬, timezone 또는 화면 포맷을 처리 | `references/date.md` |
| 리팩터링, 코드 리뷰, 구조 개선 또는 코드 변경 후 검증을 수행 | `references/quality.md`와 대상 코드 영역의 다른 참조 문서 |
| 공용 구현 중복, 확정된 마이그레이션·정리 대상을 처리 | `references/follow-up-tasks.md`, `references/workspace-packages.md` |

## 자주 겹치는 조합

- 새 API 연동 페이지: `project-architecture.md`, `routing-url-state.md`, `server-data.md`, `typescript-conventions.md`
- 상태가 있는 새 React 컴포넌트: `react-components.md`, `react-state-effects.md`, `typescript-conventions.md`
- 인증이 필요한 API·페이지: `auth.md`, `server-data.md`, `routing-url-state.md`, `module-federation.md`
- remote 추가·수정: `module-federation.md`, `workspace-packages.md`, `quality.md`
- UI 리팩터링: `quality.md`, `react-components.md`, `ui-system.md`
- Context 또는 Provider 리팩터링: `quality.md`, `react-state-effects.md`

목록에 없는 문서를 추측해서 찾지 말고, 모든 참조는 이 스킬의 `references/` 바로 아래에서 읽는다.