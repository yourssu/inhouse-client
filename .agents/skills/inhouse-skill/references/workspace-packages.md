# 공용 워크스페이스 패키지

## 적용 범위

공용 구현 탐색, 앱 내부 중복 제거, 새 패키지 API, workspace 의존성, 앱과 패키지 사이의 코드 이동에 적용한다.

## 최우선 규칙

- `packages/*`에 같은 역할의 공개 구현이 있으면 앱 내부 구현보다 항상 우선한다.
- 주변 앱에 동일하거나 유사한 복사본이 있어도 새 코드의 선례로 삼지 않는다. 공용 구현을 사용하지 않는 복사본은 결함 또는 미완료 마이그레이션이다.
- 새 구현을 만들기 전에 `packages/*/package.json`의 `name`과 `exports`, 패키지 소스의 실제 공개 API를 확인한다.
- 다른 패키지의 내부 파일 경로를 우회 import하지 않고 공개 export 경로만 사용한다.
- 현재 요청 범위에서 전체 마이그레이션을 안전하게 끝낼 수 없으면 중복을 더 늘리지 말고 남은 범위를 별도 작업으로 분리한다.

## 탐색 순서

1. 역할에 맞는 패키지가 있는지 패키지 목록과 `package.json#exports`를 확인한다.
2. `rg`로 공개 symbol과 기존 소비처를 찾는다.
3. 앱의 로컬 구현이 공용 구현과 같은 계약인지 비교한다.
4. 공용 export가 있으면 해당 경로로 import하고 소비 workspace의 의존성을 `workspace:*`로 선언한다.
5. 공용 API가 부족하면 앱에 복사본을 추가하지 말고, 실제로 둘 이상의 소비자가 같은 정책을 공유하는지 확인한 뒤 패키지 API를 확장한다.

## 현재 패키지 역할 지도

| 역할 | 먼저 확인할 패키지 |
| --- | --- |
| 인증 클라이언트·토큰·Provider·guard | `@yourssu-inhouse/auth` |
| 앱 shell 레이아웃·부트스트랩 | `@yourssu-inhouse/exterior` |
| 범용 React hook | `@yourssu-inhouse/inhouse-react/hooks` |
| 날짜·타입·객체·ky 범용 유틸 | `@yourssu-inhouse/inhouse-utils/*` |
| Button·Dialog·Table·Toast 등 UI primitive | `@yourssu-inhouse/interior` |
| Tailwind plugin·`cn`·`tv` | `@yourssu-inhouse/interior-tailwind` |
| 디자인 토큰 원천 | `@yourssu-inhouse/interior-vars` |
| Module Federation 계약·query namespace | `@yourssu-inhouse/mfa-core` |
| shell·remote preview 런타임 | `@yourssu-inhouse/mfa-shell` |
| Vite Module Federation 설정 | `@yourssu-inhouse/mfa-vite` |
| 이미지·Lottie 등 정적 리소스 | `@yourssu-inhouse/resources` |

이 표보다 현재 `package.json#exports`가 우선한다. 패키지가 추가되거나 export가 바뀌면 표도 함께 갱신한다.

## 앱 내부 구현이 허용되는 경우

- 한 앱의 도메인 의미와 변경 이유에만 결합되어 있다.
- 공용 primitive를 조합한 앱 전용 컴포넌트다.
- 공용 패키지에 같은 계약이 없고, 둘 이상의 소비자가 공유할 근거도 아직 없다.

단지 현재 한 앱에만 있다는 이유로 범용 코드를 앱에 두지 않는다. 반대로 한 번만 쓰이는 도메인 로직을 미래 재사용 가능성만으로 패키지화하지 않는다.

## 패키지 변경 검증

- JIT 소비 패키지 변경: 패키지의 type·lint·format과 모든 직접 소비 앱의 타입 검사를 실행한다.
- build 패키지 변경: 위 검사에 패키지 build와 소비 앱 build 또는 타입 검사를 추가한다.
- export 또는 peer dependency 변경: `package.json`, 실제 산출물, 소비 앱 import를 함께 확인한다.
- 공용 UI·CSS 변경: light·dark theme와 CSS 산출물을 소비 앱에서 확인한다.