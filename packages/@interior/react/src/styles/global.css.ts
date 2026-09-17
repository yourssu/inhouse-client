import { globalStyle } from '@vanilla-extract/css';

import { vars } from './color.css';
import { shadows } from './shadow.css';

globalStyle('*', {
  scrollbarWidth: 'thin',
  scrollbarColor: `${vars.palette.scrollbar} transparent`,
});

globalStyle('a:focus-visible, button:focus-visible, *[data-focus-visible="true"]:focus-visible', {
  outline: `1px solid ${vars.palette.greyOpacity500}`,
  outlineOffset: '0px',
  boxShadow: shadows.buttonFocus,
  transition: 'outline 0.1s ease, box-shadow 0.1s ease',
});

globalStyle('tr[data-focus-visible="true"]:focus-visible', {
  outline: `1.5px solid ${vars.palette.greyOpacity800}`,
  outlineOffset: '0.5px',
  boxShadow: `0 0 4px 4px ${vars.palette.greyOpacity200}`,
});
