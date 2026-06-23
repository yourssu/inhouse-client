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
  'Head lead': { base: vars.color.red500, light: vars.color.red200 },
  Android: { base: vars.color.green500, light: vars.color.green300 },
  Backend: { base: vars.color.violet500, light: vars.color.violet200 },
  Frontend: { base: vars.color.blue500, light: vars.color.blue300 },
  iOS: { base: vars.color.orange500, light: vars.color.orange400 },
  Marketing: { base: vars.color.teal500, light: vars.color.teal200 },
  'Product Design': { base: vars.color.purple600, light: vars.color.purple200 },
  Finance: { base: vars.color.yellow500, light: vars.color.yellow300 },
  HR: { base: vars.color.yellow500, light: vars.color.yellow300 },
  Legal: { base: vars.color.grey500, light: vars.color.grey200 },
  PM: { base: vars.color.red500, light: vars.color.red200 },
} as const;
