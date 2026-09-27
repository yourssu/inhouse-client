# Remote CSS 분리 후 공통 레이아웃이 깨진 이유

## 관찰한 현상

로그인한 shell에서 스카우터의 지원자·면접 일정·템플릿·메일 관리 페이지를 열면, 데스크톱 화면인데도 사이드바 아래에 본문이 놓였다. 첫 화면에는 사이드바만 보였지만, 접근성 트리와 DOM에는 본문과 데이터가 존재했고 콘솔 예외도 없었다. `PageLayout`의 계산된 `flex-direction`은 기대한 `row`가 아니라 `column`이었다.

## 근본 원인

이번 브랜치부터 shell과 remote가 Tailwind CSS를 각각 빌드한다. 따라서 브라우저에는 동일한 유틸리티 선택자가 여러 CSS 파일에서 로드된다. Tailwind는 **한 CSS 출력 안에서는** 기본 유틸리티 뒤에 반응형 유틸리티를 배치하지만, 독립적으로 만들어진 CSS 파일 사이의 순서까지 보장하지 않는다.

공통 레이아웃에는 `flex-col md:flex-row`가 있었다. shell의 `md:flex-row`가 적용되는 너비에서도 나중에 로드된 remote CSS의 `.flex-col`이 같은 속성을 다시 지정했다. 미디어 쿼리는 적용 조건일 뿐 우선순위를 높이지 않으므로, 같은 레이어·특이성에서는 뒤에 나온 규칙이 이긴다. `sm:flex-row`와 기본 `flex-col` 등 공통 레이아웃의 다른 반응형 조합도 같은 영향을 받았다.

초기 CSS 설정은 이 충돌을 더 키웠다. `@exterior/layout/index.css`를 `layer(exterior)`로 감싸면서 그 안에서 생성된 레이아웃 유틸리티도 `exterior`에 들어갔고, `@interior/tailwind/plugin.css`의 유틸리티는 레이어 밖에 생성됐다. 일반 CSS 선언은 레이어 밖 규칙이 레이어 안 규칙보다 우선하므로, 파일 순서를 조정하는 것만으로 해결할 수 없는 상태였다.

MFA의 `sharedCSS` 처리는 공통 패키지의 CSS **import**를 remote 화면용 CSS에서 분리한다. 각 앱의 Tailwind 빌드가 생성한 동일한 유틸리티 규칙까지 제거하거나 하나의 전역 순서로 재정렬하지는 않는다.

## 이번 수정의 선택

1. 공통 Tailwind 유틸리티를 명시적인 `utilities` 레이어로 출력하고, 앱에서 `@exterior/layout/index.css`를 추가 `exterior` 레이어로 감싸지 않도록 했다. 중첩 레이어 때문에 생기던 우선순위 차이를 없앤다.
2. 그래도 나중에 로드된 remote의 기본 유틸리티가 shell의 반응형 유틸리티를 덮을 수 있다. 그래서 `PageLayout`과 `PageContent`가 소유한 반응형 배치 클래스에만 Tailwind의 `!` modifier를 붙였다. 공통 레이아웃의 데스크톱 배치가 CSS 파일 로딩 순서에 흔들리지 않게 하려는 국소적 조치다.
3. 별도 미디어 쿼리와 레이아웃 전용 CSS 선택자를 만드는 방식은 제거했다. 반응형 값과 breakpoint를 Tailwind 클래스에 그대로 두기 위해서다.

이 수정은 **공통 레이아웃에서 확인된 충돌**을 해결한다. 모든 shell·remote 유틸리티 충돌을 자동으로 해결하는 것은 아니다. CSS를 독립 빌드한 상태에서 그 보장까지 필요하다면, MFA의 CSS 통합 단계에서 생성된 규칙의 중복과 적용 순서를 관리하는 별도 설계가 필요하다.

## 확인

- `pnpm check`: 51개 작업 통과
- 전체 빌드: 11개 작업 통과
- 로그인된 Chrome: 위 네 페이지의 본문이 데스크톱 첫 화면에 표시됨; 모바일 너비에서는 세로 배치 유지; 라이트·다크 모드와 새 탭 콘솔 오류 여부 확인

관련 코드: `packages/@interior/tailwind/src/plugin.css`, `packages/@exterior/layout/src/PageLayout/index.tsx`, `packages/@exterior/layout/src/PageContent/index.tsx`, `apps/*/src/styles/index.css`, `packages/@inhouse-mfa/vite/src/partitionCss.ts`.
