import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '@/styles/typography.css.ts';

export const scrollAreaRoot = style({
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
});

export const scrollAreaViewport = style({
  width: '100%',
  paddingLeft: 4,
  paddingRight: 4,
  paddingTop: 6,
  paddingBottom: 6,
});

export const stickyIndicator = recipe({
  base: {
    backgroundColor: vars.color.bg.lightBackground,
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
    transition: 'opacity 0.1s ease',
  },
  variants: {
    scrolled: {
      true: {
        zIndex: 101,
        opacity: 1,
      },
      false: {
        zIndex: 0,
        opacity: 0,
      },
    },
  },
});

export const scrollbar = style({
  position: 'absolute',
  right: 8,
  bottom: 8,
  left: 8,
  display: 'flex',
  height: 6,
  touchAction: 'none',
  flexDirection: 'column',
  backgroundColor: 'transparent',
  opacity: 0,
  transition: 'opacity 0.2s ease',
  userSelect: 'none',
  selectors: {
    '.group\\/table:hover &': {
      opacity: 1,
    },
  },
});

export const thumb = style({
  backgroundColor: vars.color.palette.scrollbar,
  position: 'relative',
  flex: 1,
  borderRadius: vars.radius.full,
  transition: 'background-color 0.15s ease',
});

export const body = style({
  position: 'absolute',
  top: 44,
  minWidth: '100%',
});

export const head = style({
  position: 'absolute',
  top: 0,
  minWidth: '100%',
});

export const headRow = style({
  display: 'flex',
  height: 44,
  width: '100%',
});

export const rowRecipe = recipe({
  base: {
    display: 'flex',
    height: 48,
    borderRadius: vars.radius[6],
    ...typography.sm,
    selectors: {
      '&:nth-of-type(2n+1)': {
        backgroundColor: vars.color.bg.tableBackground,
      },
    },
  },
  variants: {
    hoverable: {
      true: {
        cursor: 'pointer',
        selectors: {
          '&:hover': {
            backgroundColor: vars.color.palette.grey100,
          },
          '&:nth-of-type(2n+1):hover': {
            backgroundColor: vars.color.palette.grey100,
          },
          '&:focus-visible': {
            position: 'relative',
            zIndex: 100,
          },
        },
      },
    },
  },
});

export const cellRecipe = recipe({
  base: {
    color: vars.color.fg.neutralMuted,
    display: 'flex',
    height: 48,
    width: 128,
    minWidth: 128,
    flex: '1 1 0%',
    selectors: {
      '&:first-of-type': {
        borderTopLeftRadius: vars.radius[6],
        borderBottomLeftRadius: vars.radius[6],
        paddingLeft: 8,
      },
      '&:last-of-type': {
        borderTopRightRadius: vars.radius[6],
        borderBottomRightRadius: vars.radius[6],
        paddingRight: 8,
      },
    },
  },
  variants: {
    stickyHorizontal: {
      true: {
        selectors: {
          '&:first-of-type': {
            backgroundColor: vars.color.bg.lightBackground,
            position: 'sticky',
            left: 0,
            zIndex: 10,
          },
          'tr:nth-of-type(2n+1) &:first-of-type': {
            backgroundColor: vars.color.bg.tableBackground,
          },
          'tr:hover &:first-of-type': {
            backgroundColor: vars.color.palette.grey100,
          },
        },
      },
    },
    showStickyShadow: {
      true: {
        selectors: {
          '&:first-of-type::after': {
            content: '""',
            position: 'absolute',
            right: -28,
            top: 0,
            width: 28,
            height: '100%',
            display: 'block',
            background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0))',
          },
          '[data-theme="dark"] &:first-of-type::after': {
            background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0))',
          },
          'tr:last-of-type &:first-of-type::after': {
            background:
              'radial-gradient(100% 100% at 0 0, rgba(0, 0, 0, 0.04) 0, rgba(0, 0, 0, 0) 100%)',
          },
          '[data-theme="dark"] tr:last-of-type &:first-of-type::after': {
            background:
              'radial-gradient(100% 100% at 0 0, rgba(0, 0, 0, 0.15) 0, rgba(0, 0, 0, 0) 100%)',
          },
        },
      },
    },
  },
});

export const cellInner = recipe({
  base: {
    display: 'flex',
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    overflowX: 'auto',
    overflowY: 'hidden',
    paddingLeft: 4,
    paddingRight: 4,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    scrollbarWidth: 'none !important' as any,
    selectors: {
      '&::-webkit-scrollbar': {
        display: 'none !important',
      },
      'td:not(:first-of-type) &': {
        justifyContent: 'flex-end',
      },
    },
  },
  variants: {
    align: {
      left: {
        justifyContent: 'flex-start !important',
      },
      right: {
        justifyContent: 'flex-end !important',
      },
    },
  },
});

export const thRecipe = recipe({
  base: {
    color: vars.color.fg.neutralSubtle,
    display: 'flex',
    height: 44,
    width: 128,
    minWidth: 128,
    flex: '1 1 0%',
    ...typography.sm,
    fontWeight: 400,
    selectors: {
      '&:first-of-type': {
        paddingLeft: 8,
      },
      '&:last-of-type': {
        paddingRight: 8,
      },
    },
  },
  variants: {
    align: {
      left: {
        justifyContent: 'flex-start !important',
      },
      right: {
        justifyContent: 'flex-end !important',
      },
    },
    stickyHorizontal: {
      true: {
        selectors: {
          '&:first-of-type': {
            backgroundColor: vars.color.bg.lightBackground,
            position: 'sticky',
            left: 0,
            zIndex: 10,
          },
        },
      },
    },
    showStickyShadow: {
      true: {
        selectors: {
          '&:first-of-type::after': {
            content: '""',
            position: 'absolute',
            right: -28,
            top: 0,
            width: 28,
            height: '100%',
            display: 'block',
            background:
              'radial-gradient(100% 100% at 0 100%, rgba(0, 0, 0, 0.04) 0, rgba(0, 0, 0, 0) 100%)',
          },
          '[data-theme="dark"] &:first-of-type::after': {
            background:
              'radial-gradient(100% 100% at 0 100%, rgba(0, 0, 0, 0.15) 0, rgba(0, 0, 0, 0) 100%)',
          },
        },
      },
    },
  },
});

export const thContent = recipe({
  base: {
    marginLeft: 4,
    marginRight: 4,
    display: 'flex',
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    selectors: {
      'th:first-of-type &': {
        justifyContent: 'flex-start',
      },
    },
  },
  variants: {
    select: {
      true: {
        marginRight: 0,
      },
    },
    align: {
      left: {
        justifyContent: 'flex-start !important',
      },
      right: {
        justifyContent: 'flex-end !important',
      },
    },
  },
});

export const thSelectTrigger = recipe({
  base: {
    display: 'flex',
    height: 'fit-content',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRadius: vars.radius[8],
    paddingLeft: 6,
    paddingRight: 0,
    paddingTop: 2,
    paddingBottom: 2,
    transition: 'background-color 0.2s ease, color 0.2s ease',
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    selectors: {
      '&:hover': {
        backgroundColor: vars.color.palette.greyOpacity100,
      },
    },
  },
  variants: {
    hasValue: {
      true: {
        color: vars.color.palette.violet600,
        fontWeight: 500,
      },
      false: {
        color: vars.color.fg.neutralSubtle,
      },
    },
  },
});
