import { style } from '@vanilla-extract/css';
import { vars } from '@yourssu-inhouse/interior-vars';

import { shadows } from '@/styles/shadow.css.ts';
import { typography } from '@/styles/typography.css.ts';

export const overlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: vars.zIndex.modal,
});

export const content = style({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxHeight: 'calc(100vh - 40px)',
  outline: 'none',
  zIndex: vars.zIndex.modal,
});

export const dialogWrapper = style({
  backgroundColor: vars.color.bg.backgroundLevel02,
  // 인라인 조립 대신 semantic shadow 토큰을 사용해요(styles/shadow.css.ts 의 shadows.dialog).
  boxShadow: shadows.dialog,
  height: '100%',
  overflow: 'hidden',
  borderRadius: vars.radius[16],
  willChange: 'transform',
});

export const header = style({
  backgroundColor: vars.color.bg.backgroundLevel02,
  display: 'flex',
  width: '100%',
});

export const headerLeft = style({
  width: '100%',
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 20,
});

export const closeButtonWrapper = style({
  paddingTop: 20,
  paddingRight: 14,
});

export const closeButton = style({
  display: 'inline-flex',
  height: vars.uniformHeight.md,
  width: 32,
  flexShrink: 0,
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius[6],
  transition: 'background-color 0.2s ease',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.palette.grey200,
    },
    '&:active': {
      backgroundColor: vars.color.palette.grey200,
    },
    '&:focus-visible': {
      backgroundColor: vars.color.palette.grey200,
    },
  },
});

export const closeIcon = style({
  color: vars.color.fg.neutralSubtle,
  height: 20,
  width: 20,
});

export const title = style({
  fontSize: typography.xl.fontSize,
  fontWeight: 600,
});

export const contentArea = style({
  fontSize: typography['15'].fontSize,
  color: vars.color.fg.neutralMuted,
  display: 'flex',
  maxWidth: 720,
  flexDirection: 'column',
  overflowY: 'auto',
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 20,
  paddingBottom: 20,
});

export const buttonGroup = style({
  backgroundColor: vars.color.bg.backgroundLevel02,
  display: 'grid',
  width: '100%',
  gridAutoColumns: 'minmax(min-content, 96px)',
  gridAutoFlow: 'column',
  justifyContent: 'end',
  gap: 8,
  paddingLeft: 24,
  paddingRight: 24,
  paddingBottom: 20,
});

// TabDialog styles
export const tabDialogNavPanel = style({
  position: 'sticky',
  top: 0,
  flex: '27.8 1 0%',
  borderRight: `1px solid ${vars.color.palette.greyOpacity100}`,
});

export const tabDialogNavPanelAside = style({
  display: 'flex',
  width: '100%',
  height: '100%',
  flexDirection: 'column',
  gap: 4,
  paddingLeft: 16,
  paddingRight: 16,
  paddingTop: 20,
  paddingBottom: 20,
});

export const tabDialogContentPanel = style({
  display: 'flex',
  flex: '72.2 1 0%',
  flexDirection: 'column',
});

export const tabDialogContent = style({
  flex: '1 1 0%',
  overflowY: 'auto',
});

export const tabDialogButtonGroup = style({
  borderTop: `1px solid ${vars.color.palette.greyOpacity100}`,
  display: 'flex',
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 20,
  paddingBottom: 20,
});

export const tabDialogWrapper = style({
  display: 'flex',
  width: '100%',
  height: '100%',
  flexDirection: 'column',
});

export const tabDialogPanelGroup = style({
  display: 'flex',
  flex: '1 1 0%',
  overflowY: 'auto',
});

export const tabDialogContentSize = style({
  width: 720,
  height: 620,
});
