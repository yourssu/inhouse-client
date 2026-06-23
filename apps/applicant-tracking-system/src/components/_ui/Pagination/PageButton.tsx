import { tv } from '@/utils/tw';

interface PageButtonProps {
  disabled?: boolean;
  isActive: boolean;
  onClick: () => void;
  page: number;
}

const pageButton = tv({
  base: 'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-sm font-medium',
  variants: {
    variant: {
      default: 'text-greyOpacity600 hover:bg-greyOpacity100',
      active: 'bg-greyOpacity100 text-greyOpacity800',
      disabled: 'text-greyOpacity400 cursor-not-allowed',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const PageButton = ({ page, isActive, disabled = false, onClick }: PageButtonProps) => {
  const variant = disabled ? 'disabled' : isActive ? 'active' : 'default';

  return (
    <button
      aria-current={isActive ? 'page' : undefined}
      aria-label={`${page} 페이지`}
      className={pageButton({ variant })}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {page}
    </button>
  );
};
