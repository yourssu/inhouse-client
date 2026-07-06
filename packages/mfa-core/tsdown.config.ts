import { defineConfig } from 'tsdown';

/*
  mfa-core 는 build-time(mfa-vite, Vite config node context) 과 runtime(shell·remote app
  bundle) 양쪽에서 import 돼요. types 는 src/index.ts 로 두고(typecheck 는 소스 기반, dist
  불필요), runtime import 는 dist/index.mjs 를 써요(Node ESM 이 확장자 없는 내부 import 를
  못 찾는 문제를 피하려고 빌드 산출물을 제공해요).

  react/react-dom/msw/@tanstack/react-router 는 peer·singleton 이므로 번들링하지 않고
  external 로 둬요. mfa-core 본체는 DOM/react 타입을 직접 참조하지 않아 node context 에서도
  안전해요.
*/
export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: !process.argv.includes('--watch'),
  deps: {
    neverBundle: ['msw', '@tanstack/react-router'],
  },
});
