import { vars } from '@yourssu-inhouse/interior-vars';

export const ColorsView = () => {
  return (
    <div className="flex gap-4">
      {Object.entries(partColorMap).map(([part, color]) => (
        <div
          className="flex h-30 w-40 flex-col gap-1.5 rounded-lg p-2"
          key={part}
          style={{ backgroundColor: color.light }}
        >
          <span className="text-15 font-medium">{part}</span>
          <span className="text-15 font-medium">박지민</span>
        </div>
      ))}
    </div>
  );
};

const partColorMap = {
  'Head lead': { base: vars.color.palette.red500, light: vars.color.palette.red200 },
  Android: { base: vars.color.palette.green500, light: vars.color.palette.green300 },
  Backend: { base: vars.color.palette.violet500, light: vars.color.palette.violet200 },
  Frontend: { base: vars.color.palette.blue500, light: vars.color.palette.blue300 },
  iOS: { base: vars.color.palette.orange500, light: vars.color.palette.orange400 },
  Marketing: { base: vars.color.palette.teal500, light: vars.color.palette.teal200 },
  'Product Design': { base: vars.color.palette.purple600, light: vars.color.palette.purple200 },
  Finance: { base: vars.color.palette.yellow500, light: vars.color.palette.yellow300 },
  HR: { base: vars.color.palette.yellow500, light: vars.color.palette.yellow300 },
  Legal: { base: vars.color.palette.grey500, light: vars.color.palette.grey200 },
  PM: { base: vars.color.palette.red500, light: vars.color.palette.red200 },
} as const;
