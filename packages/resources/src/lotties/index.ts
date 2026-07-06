import emptyData from './empty.json';
import errorData from './error.lottie.json';
import leftArrowData from './left-arrow.lottie.json';
import successData from './success.lottie.json';

/*
  @toss/lottie 의 Lottie 컴포넌트는 json prop 으로 stringified JSON 문자열을 받아
  내부에서 JSON.parse 로 소비해요. 그래서 런타임 fetch(src) 에 의존하지 않고 번들에
  포함된 데이터로 로띠을 그릴 수 있어요. module federation host(shell) origin 에
  lottie 파일이 없어도, remote 가 자기 번들에 데이터를 들고 와 문제가 없어요.

  각 lottie 는 named export 로 노출하고, 상위(index.ts)에서 `export * as lotties` 로
  묶어요. package.json 의 sideEffects:false 와 함께, 사용처가 lotties.empty 만 쓰면
  나머지 lottie(error/success 등)는 tree-shaking 으로 번들에서 빠져요.
*/
export const empty = JSON.stringify(emptyData);
export const error = JSON.stringify(errorData);
export const leftArrow = JSON.stringify(leftArrowData);
export const success = JSON.stringify(successData);
