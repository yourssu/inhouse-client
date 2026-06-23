import { Button } from '@/components/_ui/Button';

const variants = ['primary', 'secondary', 'subPrimary', 'transparent'] as const;
const sizes = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;

export const ButtonView = () => {
  return (
    <div className="flex flex-col gap-8">
      {variants.map((variant) => (
        <div className="flex flex-col gap-4" key={variant}>
          <h3 className="text-15 text-greyOpacity900 font-semibold capitalize">{variant}</h3>
          <div className="flex flex-wrap items-center gap-4">
            {sizes.map((size) => (
              <Button key={`active-${size}`} size={size} variant={variant}>
                {size}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {sizes.map((size) => (
              <Button disabled key={`disabled-${size}`} size={size} variant={variant}>
                {size}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {sizes.map((size) => (
              <Button key={`disabled-${size}`} loading size={size} variant={variant}>
                {size}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
