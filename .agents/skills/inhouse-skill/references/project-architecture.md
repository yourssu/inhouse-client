# 프로젝트 구조

## 적용 범위

모노레포 경계, 앱·패키지 배치, import 경로와 기능 폴더 구조를 변경할 때 적용한다. 공용 패키지는 `workspace-packages.md`, 라우팅은 `routing-url-state.md`, Module Federation은 `module-federation.md`를 함께 읽는다.

## 필수 규칙

- 패키지 관리와 워크스페이스 명명에는 `pnpm`을 사용한다.
- `apps/*`끼리 직접 의존하지 않는다. 여러 앱이 공유하는 코드는 역할에 맞는 `packages/*` 워크스페이스 패키지로 이동한다.
- `packages/*`에 같은 역할의 공개 구현이 있으면 앱 내부 구현보다 항상 우선한다. 앱에 남은 복사본은 선례가 아니라 정리되지 않은 결함이다.
- 앱 내부의 `@/` alias는 해당 앱의 `src/`만 가리킨다. 다른 앱이나 패키지를 가리키는 용도로 사용하지 않는다.
- 워크스페이스 패키지를 외부에서 사용할 때는 `@yourssu-inhouse/*` 패키지명과 공개된 export 경로로 import한다.
- 자동 생성 파일인 `apps/*/src/routeTree.gen.ts`는 직접 수정하지 않는다.

## import 경로 기본 선택

- 앱에서 다른 기능·공용 모듈을 참조할 때는 `@/` 절대 경로를 우선한다.
- 같은 기능 폴더 안에서 함께 이동하고 같은 변경 이유를 공유하는 파일은 짧은 상대 경로를 사용할 수 있다.
- 패키지 내부 import는 패키지의 배포 방식에 따라 결정한다.
  - 소스가 JIT로 소비되어 실행 환경이 TypeScript alias를 해석하지 못하는 패키지는 상대 경로를 사용한다.
  - `tsdown` 등으로 빌드되고 `tsconfig`와 빌더가 alias를 해석하는 패키지는 `@/` alias를 기본으로 한다.
- alias를 새로 도입하거나 기존 import를 일괄 변경하기 전에 해당 패키지의 `package.json`, `tsconfig*`, 빌드 결과를 확인한다.

## 기능 배치 기본 선택

- 한 페이지에서만 쓰는 컴포넌트, 훅, Context, 유틸은 해당 라우트 하위에 둔다.
- 앱 전체에서 재사용하는 도메인 합성 컴포넌트는 앱의 `src/components`에 둔다.
- 둘 이상의 앱에서 재사용하거나 앱과 무관한 구현은 `workspace-packages.md`의 역할 지도를 확인해 적절한 패키지에 둔다.

## 현재 구현 확인 지점

- 빌드 순서와 영향 범위: `turbo.json`
- 워크스페이스와 공통 버전: `pnpm-workspace.yaml`
- 앱별 alias: `apps/*/tsconfig.json`
- 패키지 배포 방식: `packages/*/package.json`, `packages/*/tsconfig*.json`

구체적인 앱 목록, 포트, export 파일명, 빌드 단계 수는 변경될 수 있으므로 문서의 기억보다 위 설정 파일을 우선한다.

## 검증

- 패키지 경계나 alias 변경 후 해당 패키지의 `check:type`, `check:lint`, `check:format`을 실행한다.
- build script가 있는 패키지는 build하고 소비 앱의 타입 검사 또는 build를 추가한다.
- 실제 workspace 이름과 script는 대상 `package.json`에서 확인하고 존재하지 않는 명령을 추측하지 않는다.