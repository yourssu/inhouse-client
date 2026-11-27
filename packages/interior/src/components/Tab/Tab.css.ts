import { style } from '@vanilla-extract/css';

export const panel = style({
  selectors: {
    // asChild로 받은 요소의 display 클래스가 hidden 속성을 덮어쓰지 않게 한다.
    '&[hidden]': {
      display: 'none',
    },
  },
});
