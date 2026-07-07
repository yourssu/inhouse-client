/*
  로고 이미지는 `new URL('./logo-*.png', import.meta.url).href` 로 참조해요.
  단순 static import(`import x from './x.png'`) 는 빌드 시 `/assets/logo-[hash].png`
  같은 루트 상대 문자열로 치환되는데, 이 문자열이 `<img src>` 로 쓰이면 브라우저가
  document(host shell) origin 기준으로 해석해 remote 자산을 못 가져와요.
  `import.meta.url` 기반 참조는 청크가 로드된 실제 origin(remote 자기 origin) 기준으로
  해석돼요. module federation 은 JS 청크 preload 만 rewriting 하고 임의 asset 문자열은
  안 건드려요 — 그래서 명시적으로 import.meta.url 기반을 써요. lotties 가 번들에 데이터를
  들고 와 origin 의존을 끊는 것과 같은 동기예요(여기선 데이터가 아니라 URL 해석으로).

  각 로고는 named export 로 노출하고, 상위(index.ts)에서 `export * as images` 로 묶어요.
  주의: lotties 와 달리 `new URL(..., import.meta.url)` 은 빌드 타임 asset emit 을 수반해
  side-effect 성이라, 사용처가 일부 로고만 써도 이 모듈의 나머지 로고가 번들에 포함돼요
  (member 단위 tree-shaking 안 됨). 로고가 많아져 번들이 커지면 앱별로
  images/<app>/ 서브모듈을 나눠 모듈 단위로 격리하는 게 나아요.
*/
export const inhouseLogoDark = new URL('./logo-inhouse-dark.png', import.meta.url).href;
export const inhouseLogoLight = new URL('./logo-inhouse-light.png', import.meta.url).href;
export const scouterLogoDark = new URL('./logo-scouter-dark.png', import.meta.url).href;
export const scouterLogoLight = new URL('./logo-scouter-light.png', import.meta.url).href;
