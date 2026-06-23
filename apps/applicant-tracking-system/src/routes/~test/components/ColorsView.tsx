import { partColorMap } from '@/types/parts';

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
