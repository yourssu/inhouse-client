import { defineConfig } from 'tsdown';

/*
  mfa-vite 는 Vite config(node context) 에서 로드돼요. types 는 src/index.ts(typecheck 소스
  기반), runtime import 는 dist/index.mjs(Node ESM 이 확장자 없는 내부 import 를 못 찾는 문제
  방지). @module-federation/vite·vite·mfa-core 는 external 로 둬요.
*/
export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: !process.argv.includes('--watch'),
  deps: {
    neverBundle: ['@module-federation/vite', 'vite', '@yourssu-inhouse/mfa-core'],
  },
});
