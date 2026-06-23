import { cn, tv } from '@/utils/tw';

const switchVariants = tv({
  slots: {
    base: 'group relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-50',
    thumb:
      'shadow-switch-thumb pointer-events-none m-0.5 block rounded-full bg-white ring-0 transition-transform duration-200 ease-in-out',
  },
  variants: {
    checked: {
      true: {
        base: 'bg-violet500 hover:bg-violet600',
      },
      false: {
        base: 'bg-greyOpacity100 hover:bg-greyOpacity200',
        thumb: 'translate-x-0',
      },
    },
    /* 
      NOTE: 계산식
      - margin은 무조건 2px로 고정 (m-0.5)
      - 컨테이너 너비: thumb 지름 * 2 + left margin 값
      - 컨테이너 높이: thumb 지름 + top margin 값 + bottom margin 값
      - thumb 이동 거리: thumb 지름 - left margin 값
    */
    size: {
      sm: {
        base: 'h-4 min-w-[26px]',
        thumb: 'size-3',
      },
      md: {
        base: 'h-5 min-w-[34px]',
        thumb: 'size-4',
      },
      lg: {
        base: 'h-6 min-w-[42px]',
        thumb: 'size-5',
      },
      xl: {
        base: 'h-7 min-w-[50px]',
        thumb: 'size-6',
      },
    },
  },
  compoundVariants: [
    { checked: true, size: 'sm', class: { thumb: 'translate-x-[10px]' } },
    { checked: true, size: 'md', class: { thumb: 'translate-x-[14px]' } },
    { checked: true, size: 'lg', class: { thumb: 'translate-x-[18px]' } },
    { checked: true, size: 'xl', class: { thumb: 'translate-x-[22px]' } },
  ],
  defaultVariants: {
    checked: false,
    size: 'md',
  },
});

export type SwitchProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size: 'lg' | 'md' | 'sm' | 'xl';
};

export const Switch = ({
  className,
  checked = false,
  onCheckedChange,
  size,
  ...props
}: SwitchProps) => {
  const { base, thumb } = switchVariants({ checked, size });

  return (
    <button
      aria-checked={checked}
      className={cn(base(), className)}
      onClick={() => onCheckedChange?.(!checked)}
      role="switch"
      type="button"
      {...props}
    >
      <span className={cn(thumb())} />
    </button>
  );
};
