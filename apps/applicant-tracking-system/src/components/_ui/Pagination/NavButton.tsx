import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

import { tv } from '@/utils/tw';

interface NavButtonProps {
  direction: 'next' | 'prev';
  disabled?: boolean;
  onClick: () => void;
}

const navButton = tv({
  base: 'text-greyOpacity500 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full',
  variants: {
    disabled: {
      true: 'text-greyOpacity300 cursor-not-allowed',
      false: 'hover:bg-greyOpacity100 hover:text-greyOpacity600',
    },
  },
});

export const NavButton = ({ direction, disabled = false, onClick }: NavButtonProps) => {
  const Icon = direction === 'prev' ? MdChevronLeft : MdChevronRight;
  const label = direction === 'prev' ? '이전 페이지' : '다음 페이지';

  return (
    <button
      aria-label={label}
      className={navButton({ disabled })}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Icon size={20} />
    </button>
  );
};
