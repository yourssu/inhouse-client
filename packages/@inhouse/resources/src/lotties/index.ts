import emptyData from './empty.json';
import errorData from './error.lottie.json';
import leftArrowData from './left-arrow.lottie.json';
import successData from './success.lottie.json';

// NOTE: tree-shaking을 위해 개발 named export를 수행합니다. `sideEffect: false` 를 유지해주세요.

export const empty = JSON.stringify(emptyData);
export const error = JSON.stringify(errorData);
export const leftArrow = JSON.stringify(leftArrowData);
export const success = JSON.stringify(successData);
