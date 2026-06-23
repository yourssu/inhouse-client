import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '../../styles/typography.css.ts';

export const trigger = recipe({
  base: {
    display: 'flex',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    paddingTop: 8,
    paddingBottom: 8,
    color: vars.color.greyOpacity800,
    transition: 'colors 0.2s ease, box-shadow 0.2s ease',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    selectors: {
      '&:disabled': {
        color: vars.color.greyOpacity300,
        cursor: 'not-allowed',
      },
    },
  },
  variants: {
    variant: {
      outline: {
        boxShadow: `inset 0 0 0 1px ${vars.color.grey200}`,
        selectors: {
          '&:hover:not(:disabled)': {
            boxShadow: `inset 0 0 0 1px ${vars.color.violetOpacity200}`,
          },
        },
      },
      dimmed: {
        backgroundColor: vars.color.greyOpacity100,
        selectors: {
          '&:hover:not(:disabled)': {
            backgroundColor: vars.color.greyOpacity200,
          },
        },
      },
      inline: {
        selectors: {
          '&:hover:not(:disabled)': {
            backgroundColor: vars.color.buttonTransparentBackgroundHovered,
          },
        },
      },
    },
    size: {
      xs: {
        height: 24,
        ...typography['13'],
      },
      sm: {
        height: 28,
        ...typography['13'],
      },
      md: {
        height: 32,
        ...typography.sm,
      },
      lg: {
        height: 38,
        ...typography['15'],
      },
    },
  },
});

export const placeholder = style({
  color: vars.color.grey400,
});

export const triggerSpan = style({
  paddingLeft: 14,
  paddingRight: 14,
});

export const popoverContent = style({
  backgroundColor: vars.color.floatBackground,
  boxShadow: `0 0 0 1px ${vars.shadow.shadowMedium00}, 0 10px 30px 0 ${vars.shadow.shadowMedium01}, 0 20px 40px 0 ${vars.shadow.shadowMedium02}`,
  borderRadius: 12,
  padding: 16,
  outline: 'none',
});

export const footer = style({
  marginTop: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 8,
});

export const triggerRangeContainer = style({
  display: 'flex',
  alignItems: 'center',
});

export const triggerRangeValue = style({
  minWidth: 124,
  paddingLeft: 14,
  paddingRight: 14,
  textAlign: 'left',
});

export const triggerRangeSeparator = recipe({
  base: {
    color: vars.color.greyOpacity400,
    transition: 'color 0.2s ease',
  },
  variants: {
    disabled: {
      true: {
        color: vars.color.greyOpacity200,
      },
    },
  },
});

export const panelContainer = style({
  display: 'flex',
  gap: 24,
});

// CalendarPanel Header
export const panelHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBottom: 16,
});

export const panelHeaderSelectGroup = style({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
});

export const panelHeaderNav = style({
  display: 'flex',
});

export const panelHeaderChevron = style({
  color: vars.color.neutralSubtle,
  width: 20,
  height: 20,
});

// DateSelect
export const selectTrigger = style({
  display: 'flex',
  cursor: 'pointer',
  alignItems: 'center',
  gap: 4,
  borderRadius: 6,
  paddingLeft: 6,
  paddingRight: 6,
  paddingTop: 2,
  paddingBottom: 2,
  ...typography.base,
  fontWeight: 600,
  transition: 'background-color 0.2s ease',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.greyOpacity100,
    },
  },
});

export const selectArrow = style({
  color: vars.color.grey500,
  width: 16,
  height: 16,
  transition: 'transform 0.2s ease',
});

export const selectMenu = style({
  backgroundColor: vars.color.floatBackground,
  boxShadow: `0 0 0 1px ${vars.shadow.shadowMedium00}, 0 10px 30px 0 ${vars.shadow.shadowMedium01}, 0 20px 40px 0 ${vars.shadow.shadowMedium02}`,
  maxHeight: 240,
  overflowY: 'auto',
  borderRadius: 8,
  paddingTop: 8,
  paddingBottom: 8,
});

export const selectOption = recipe({
  base: {
    display: 'block',
    width: '100%',
    cursor: 'pointer',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 6,
    paddingBottom: 6,
    textAlign: 'left',
    ...typography.sm,
    transition: 'colors 0.2s ease',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    selectors: {
      '&:hover': {
        backgroundColor: vars.color.greyOpacity100,
      },
    },
  },
  variants: {
    selected: {
      true: {
        color: vars.color.violet500,
        fontWeight: 500,
      },
    },
  },
});

// DateGrid
export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
});

export const emptyCell = style({
  width: 32,
  height: 32,
});

// DateGridHeader
export const gridHeader = style({
  marginBottom: 4,
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
});

export const gridHeaderCell = style({
  color: vars.color.neutralMuted,
  ...typography['13'],
  paddingTop: 4,
  paddingBottom: 4,
  textAlign: 'center',
  fontWeight: 500,
  selectors: {
    '&:first-of-type': {
      color: vars.color.red500,
    },
  },
});

// DateGridCell
export const cellContainer = style({
  display: 'flex',
  height: 36,
  width: 32,
  alignItems: 'center',
  justifyContent: 'center',
});

export const cellButton = style({
  position: 'relative',
  width: '100%',
  height: '100%',
  cursor: 'pointer',
  paddingTop: 2,
  paddingBottom: 2,
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
});

export const rangeBackdrop = recipe({
  base: {
    backgroundColor: vars.color.greyOpacity100,
    position: 'absolute',
    top: 2,
    bottom: 2,
    zIndex: 0,
    width: '50%',
  },
  variants: {
    position: {
      start: {
        right: 0,
      },
      end: {
        left: 0,
      },
    },
  },
});

export const todayDot = recipe({
  base: {
    position: 'absolute',
    top: 4,
    left: '50%',
    zIndex: 20,
    height: 4,
    width: 4,
    transform: 'translateX(-50%)',
    borderRadius: 9999,
  },
  variants: {
    selected: {
      true: {
        backgroundColor: '#ffffff',
      },
      false: {
        backgroundColor: vars.color.violet600,
      },
    },
  },
});

export const cellStyle = recipe({
  base: {
    ...typography['13'],
    display: 'flex',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    transition: 'background-color 0.15s ease, color 0.15s ease',
    selectors: {
      'button:hover:not(:disabled) &': {
        backgroundColor: vars.color.greyOpacity100,
      },
      'button:disabled &': {
        color: vars.color.grey300,
        cursor: 'not-allowed',
      },
    },
  },
  variants: {
    status: {
      default: {},
      disabled: {},
      range: {
        backgroundColor: vars.color.greyOpacity100,
        color: vars.color.neutralMuted,
        borderRadius: 0,
        selectors: {
          'button:hover:not(:disabled) &': {
            backgroundColor: vars.color.greyOpacity100,
          },
        },
      },
      selected: {
        backgroundColor: vars.color.violet500,
        color: '#ffffff',
        position: 'relative',
        zIndex: 10,
        selectors: {
          'button:hover:not(:disabled) &': {
            backgroundColor: vars.color.violet600,
          },
        },
      },
      future: {
        color: vars.color.grey400,
      },
    },
  },
});
