import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

import * as styles from './Pagination.css';

interface NavButtonProps {
  direction: 'next' | 'prev';
  disabled?: boolean;
  onClick: () => void;
}

export const NavButton = ({ direction, disabled = false, onClick }: NavButtonProps) => {
  const Icon = direction === 'prev' ? MdChevronLeft : MdChevronRight;
  const label = direction === 'prev' ? '이전 페이지' : '다음 페이지';

  return (
    <button
      aria-label={label}
      className={styles.navButtonRecipe({ disabled })}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Icon size={20} />
    </button>
  );
};
