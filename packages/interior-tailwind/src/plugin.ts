import { objectEntries, objectKeys } from '@yourssu-inhouse/inhouse-utils/object';
import { vars } from '@yourssu-inhouse/interior-vars';
import plugin from 'tailwindcss/plugin';

const getInteriorColors = () => {
  const colorNames = objectKeys(vars.color);
  return {
    ...Object.fromEntries(colorNames.map((key) => [key, vars.color[key]])),
  };
};

const getInteriorFontSizes = () =>
  Object.fromEntries(
    objectEntries(vars.typography.fontSize).map(([key, value]) => {
      const lineHeightValue = vars.typography.lineHeight[key];
      return [key, lineHeightValue ? [value, lineHeightValue] : value];
    }),
  );

const getInteriorLineHeights = () =>
  Object.fromEntries(
    objectEntries(vars.typography)
      .filter(([key]) => key.endsWith('-line-height'))
      .map(([key, value]) => [key.replace('-line-height', ''), value]),
  );

const getShadow = () => {
  const shadowNames = objectKeys(vars.shadow);
  return Object.fromEntries(shadowNames.map((key) => [key, vars.shadow[key]]));
};

export default plugin(() => {}, {
  theme: {
    extend: {
      colors: getInteriorColors(),
      fontSize: getInteriorFontSizes(),
      lineHeight: getInteriorLineHeights(),
      shadow: getShadow(),
    },
  },
});
