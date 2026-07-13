import { Badge } from '@yourssu-inhouse/interior';

export const BadgeView = () => {
  return (
    <>
      <div className="flex flex-col gap-4">
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => {
          const a = ['blue', 'green', 'grey', 'red', 'violet', 'yellow'] as const;
          return (
            <div className="flex gap-4" key={size}>
              {a.map((color) => (
                <Badge color={color} key={color} size={size}>
                  badge
                </Badge>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
};
