# 리팩터링과 검증

## 적용 범위

리팩터링, 코드 리뷰, 가독성 개선, 구조 정리 또는 코드 변경 후 검증에 적용한다.

## 필수 규칙

- 리팩터링은 사용자에게 보이는 동작과 공개 계약을 보존한다. 동작 변경이 필요하면 리팩터링과 구분한다.
- 현재 작업과 관련된 도메인 reference만 읽고 적용한다. 모든 reference를 기계적으로 읽지 않는다.
- 사용자 변경 사항과 작업 범위 밖의 코드를 임의로 되돌리거나 함께 정리하지 않는다.
- 자동 생성 파일과 build artifact를 직접 고치지 않는다.
- 코드 변경 후 최소한 변경한 워크스페이스의 타입 검사와 정적 검사를 수행한다.
- 자동 검사가 통과했다는 사실을 사용자 동작까지 검증했다는 의미로 확장하지 않는다.

## 리팩터링 판단 기준

- 먼저 대상의 입력, 출력, 상태 소유자, 부수 효과, 실제 동작을 확인한다.
- 상위 호출부는 계약을 이해하는 데 필요한 범위까지만 읽는다. "항상 전체 부모 트리를 읽기"를 목표로 하지 않는다.
- 같은 텍스트가 아니라 같은 정책과 변경 이유가 반복될 때 추상화한다.
- 한 번만 쓰이는 짧은 계산과 표현은 호출부에서 더 명확하면 그대로 둔다.
- 상태와 조건이 많으면 가능한 상태를 타입과 구조로 줄이고, 원인·판단·결과를 가까이 둔다.
- `SwitchCase`, Render Props, Context, custom hook 같은 패턴을 목표로 삼지 않는다. 현재 문제를 가장 작게 해결하는 수단으로만 선택한다.

## 사용자 확인이 필요한 경우

다음처럼 선택에 따라 동작이나 공개 구조가 달라질 때만 짧게 확인한다.

- 리팩터링 범위를 파일 내부로 제한할지 상위 API까지 바꿀지 불명확하다.
- 여러 목표가 충돌한다. 예: 재사용성 확대와 변경 최소화
- 기존의 이상해 보이는 동작이 버그인지 호환성 요구인지 코드에서 판단할 수 없다.
- 새로운 의존성·전역 상태·공개 패키지 API가 필요하다.

안전한 동작 보존 리팩터링의 목표를 코드와 요청에서 판단할 수 있으면 불필요하게 작업을 멈추지 않는다.

## 검증 범위

1. 변경한 파일과 직접 연결된 테스트·타입 검사를 먼저 실행한다.
2. 대상 `package.json`의 `name`으로 workspace를 식별하고 filter 명령을 사용한다.
3. build되는 공용 패키지 변경이면 해당 패키지 build와 소비 앱 타입 검사를 추가한다.
4. 공용 설정, workspace 계약, Module Federation 변경이면 루트 검사를 실행한다.
5. 변경된 동작의 성공·실패·취소·경계 조건 중 실제로 영향 받는 항목을 확인한다.

앱 검증 예시는 다음과 같다. workspace 이름은 대상 앱이나 패키지에 맞게 바꾼다.

```bash
pnpm --filter @yourssu-inhouse/inhouse check:type
pnpm --filter @yourssu-inhouse/inhouse check:lint
pnpm --filter @yourssu-inhouse/inhouse check:format
```

반복 실행에는 스킬의 검증 스크립트를 사용할 수 있다.

```bash
.agents/skills/inhouse-skill/scripts/validate-workspace.sh \
  @yourssu-inhouse/inhouse --build --test-if-present
```

- `--build`: 성공 로그를 줄이는 `silent-build.sh`로 대상 workspace build를 실행한다. build script가 없으면 실패로 보고한다.
- `--test-if-present`: `test` script가 있으면 실행하고, 없으면 없다는 사실을 출력한다.
- type·lint·format·선택한 build·test는 가능한 항목을 끝까지 실행하고 마지막에 실패 항목을 모아 보고한다.

## 변경 위협별 필수 검증

| 변경 범위 | 추가 검증 |
| --- | --- |
| 일반 TypeScript·React 코드 | 대상 workspace type·lint·format, 관련 test |
| route 파일·search schema·loader | 대상 앱 build, 생성된 route tree diff, 새로고침·뒤로가기·잘못된 URL |
| API schema·fetcher·query·mutation | schema 실패, 네트워크 실패, query key 입력, mutation 뒤 cache 갱신 |
| Dialog·form·overlay | 확인·취소·외부 닫기·Escape·중복 제출·성공·실패 |
| 공용 JIT 패키지 | 패키지 검사, 모든 직접 소비 앱 type 검사 |
| 공용 build·CSS 패키지 | 패키지 build, 소비 앱 type 또는 build, light·dark UI |
| Module Federation | 관련 MF 패키지, shell·remote build, remote preview와 shell 조합 |
| 인증 | `auth.md`의 로그인·복원·로그아웃·갱신 성공·실패 시나리오 |

표의 모든 시나리오를 기계적으로 실행하지 않는다. 변경이 영향을 주는 행을 선택하고, 선택 이유와 실행하지 못한 항목을 결과에 남긴다.

### 빌드를 통한 검증

작업 결과를 검증하기 위해 build를 실행할 때는 성공 로그가 컨텍스트를 차지하지 않도록 전용 스크립트를 사용한다.

```bash
.agents/skills/inhouse-skill/scripts/silent-build.sh \
  @yourssu-inhouse/inhouse
```

- 성공하면 workspace와 성공 여부만 출력하고, 실패하면 진단에 필요한 전체 빌드 로그와 종료 코드를 전달한다.
- route 파일 변경은 별도 생성 명령을 추측하지 말고 대상 앱 build로 생성·타입 계약을 확인한다.
- build가 갱신한 `routeTree.gen.ts`는 source route에서 파생된 변경인지 diff로 확인한다. 직접 편집하거나 생성 파일이라는 이유만으로 필요한 diff를 되돌리지 않는다.
- 빌드 산출물 생성 자체가 사용자 요청이거나 작업 과정의 목적인 경우에는 대상 workspace의 일반 build 명령을 사용한다.

루트의 현재 검사 명령은 다음과 같다.

```bash
pnpm check:type
pnpm check:lint
pnpm check:format
```

루트 `fix:lint`, `fix:format`은 현재 `check:*`에 매핑되어 있으므로 이름만 보고 자동 수정된다고 가정하지 않는다. 자동 수정이 필요하면 대상 워크스페이스의 실제 script를 확인한다.

## 테스트와 검증 보고

- 대상 workspace에 `test` script가 있으면 관련 테스트를 실행한다.
- `test` script가 없으면 "자동화된 테스트 없음"과 대신 실행한 타입 검사·린트·포맷·조건부 build·행동 확인을 결과에 적는다.
- 테스트 인프라가 없는 workspace의 기능 작업에서 새로운 test framework를 임의로 도입하지 않는다. 도입은 별도 공개 구조 결정으로 다루되, 테스트 부재를 남은 위험에서 제외하지 않는다.
- 환경이나 기존 오류 때문에 실행하지 못한 검증은 성공으로 표시하지 않는다. 실행한 명령, 종료 결과, 남은 위험을 구분해 보고한다.
- 수동 확인을 실행하지 않았다면 문서의 체크리스트를 읽었다는 사실만으로 "확인 완료"라고 쓰지 않는다.

## 후속 작업 분리

- 기능 변경 중 발견한 광범위한 import alias 마이그레이션, Provider 구조 변경, 전역 포맷 정리는 현재 요청에 필요하지 않으면 별도 커밋 후보로 기록한다.
- 후속 작업을 이유로 현재 코드에 임시 추상화나 중복 호환 계층을 추가하지 않는다.

## 결과 보고

- 변경한 구조와 보존한 동작을 간단히 보고한다.
- 자동 검증은 실행한 명령과 성공·실패를 적는다.
- 행동 검증은 실제로 확인한 시나리오와 결과를 적는다.
- 실행하지 못한 검증과 남은 위험을 별도로 적고 숨기지 않는다.