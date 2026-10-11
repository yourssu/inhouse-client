import * as styles from './Pagination.css';

interface PageButtonProps {
  disabled?: boolean;
  isActive: boolean;
  onClick: () => void;
  page: number;
}

export const PageButton = ({ page, isActive, disabled = false, onClick }: PageButtonProps) => {
  const variant = disabled ? 'disabled' : isActive ? 'active' : 'default';

  return (
    <button
      aria-current={isActive ? 'page' : undefined}
      aria-label={`${page} 페이지`}
      className={styles.pageButtonRecipe({ variant })}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {page}
    </button>
  );
};
