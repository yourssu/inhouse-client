# inhouse-patches

inhouse 작업 중 외부 라이브러리 문제를 해결하기 위한 임시 패치입니다.

- @tailwindcss/vite@4.3.3
  - 외부 파일 변경 시 HMR Full Reload가 불필요하게 발생하는 문제 (tailwindlabs/tailwindlabs PR[#20414](https://github.com/tailwindlabs/tailwindcss/pull/20414)) 해결
  - 현재 픽스가 배포되지 않은 상태로, 배포될 것으로 예상되는 @tailwindcss/vite@4.3.4 릴리즈 시 이 패치를 제거하여야 합니다.
