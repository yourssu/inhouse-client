# inhouse-patches

inhouse 작업 중 외부 라이브러리 문제를 해결하기 위한 임시 패치입니다.

- @tailwindcss/vite@4.3.3
  - 외부 파일 변경 시 HMR Full Reload가 불필요하게 발생하는 문제 (tailwindlabs/tailwindlabs PR[#20414](https://github.com/tailwindlabs/tailwindcss/pull/20414)) 해결
  - 현재 픽스가 배포되지 않은 상태로, 배포될 것으로 예상되는 @tailwindcss/vite@4.3.4 릴리즈 시 이 패치를 제거하여야 합니다.

- vite@8.2.2
  - **Upstream 확인: 2026-09-27.**
  - 동적 import의 CSS preload helper가 요청 시작 시 `seen[url] = true` 를 기록하고, CSS 로딩에 실패해도 해당 기록과 `<link>` 를 남기는 문제를 보완해요. 같은 CSS를 다시 요청하면 로딩을 건너뛰어 CSS 없이 JS가 실행될 수 있습니다.
  - 같은 CSS를 동시에 요청하는 경우에도 후속 호출이 진행중인 CSS 요청의 완료를 기다리지 않는 문제가 있습니다.
  - 이 패치는 CSS 요청 Promise를 공유하고, 실패 시 캐시와 `<link>`를 제거합니다. 자동 재시도 루프를 추가하는 것이 아니라, 다음 로딩 시도에서 CSS를 다시 요청하고 기다릴 수 있게 합니다. 스타일 격리와는 별개의 자산 로딩 보완입니다.
  - Vite 업데이트 시 upstream에서 CSS 요청 공유 / 실패 정리 문제가 해결됐는지 확인한 뒤 패치를 제거합니다. 수정이 없다면 새 버전에 맞게 패치를 재검토해야 합니다.

- msw@2.14.6
  - 기존 ServiceWorker registration을 백그라운드에서 갱신하는 `update()` Promise의 rejection을 처리합니다. 마지막 client의 `stop()`과 다음 `start()`가 겹치면 registration이 사라지면서 Chrome에서 `Not found` 오류가 발생할 수 있습니다.
  - 이미 현재 페이지를 제어하는 worker는 유지합니다. Member에서 origin 전체의 registration을 강제로 해제하지 않으므로 다른 shell 탭의 MSW 수명에 개입하지 않습니다.
  - source·ESM·CJS 진입점을 동일하게 패치하며, `packages/@inhouse-mfa/vite/src/plugins/memberWorker.test.ts`에서 설치된 SDK의 갱신 실패 경로를 검증합니다.
  - 업데이트 시 upstream에서 background update rejection을 처리하는지 확인한 뒤 패치를 제거합니다.
