import { objectEntries } from '@yourssu-inhouse/inhouse-utils/object';
import { vars } from '@yourssu-inhouse/interior-vars';
import plugin from 'tailwindcss/plugin';

const getInteriorColors = () => ({
  ...vars.color.palette,
  ...vars.color.fg,
  ...vars.color.bg,
});

const getInteriorFontSizes = () =>
  Object.fromEntries(
    objectEntries(vars.typography.fontSize).map(([key, value]) => {
      const lineHeightValue = vars.typography.lineHeight[key];
      return [key, lineHeightValue ? [value, lineHeightValue] : value];
    }),
  );

const getInteriorLineHeights = () => Object.fromEntries(objectEntries(vars.typography.lineHeight));

const getInteriorShadows = () => Object.fromEntries(objectEntries(vars.shadow));

const getInteriorTransitionTimingFunctions = () =>
  Object.fromEntries(objectEntries(vars.transition.timingFunction));

const getInteriorRadius = () => Object.fromEntries(objectEntries(vars.radius));

const getInteriorUniformHeights = () => Object.fromEntries(objectEntries(vars.uniformHeight));

const getInteriorZIndex = () => Object.fromEntries(objectEntries(vars.zIndex));

export default plugin(() => {}, {
  theme: {
    extend: {
      colors: getInteriorColors(),
      fontSize: getInteriorFontSizes(),
      lineHeight: getInteriorLineHeights(),
      shadow: getInteriorShadows(),
      transitionTimingFunction: getInteriorTransitionTimingFunctions(),
      borderRadius: getInteriorRadius(),
      height: getInteriorUniformHeights(),
      zIndex: getInteriorZIndex(),
    },
  },
});
