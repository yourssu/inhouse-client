import clsx from 'clsx';

import { useTableContext } from './context';
import * as styles from './Table.css';

type CellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  align?: 'left' | 'right';
  ref?: React.Ref<HTMLTableCellElement>;
};

export const Cell = ({
  children,
  className,
  align,
  ...props
}: React.PropsWithChildren<CellProps>) => {
  const { stickyHorizontal, showStickyShadow } = useTableContext();

  return (
    <td
      className={clsx(styles.cellRecipe({ stickyHorizontal, showStickyShadow }), className)}
      {...props}
    >
      <div className={styles.cellInner({ align })}>{children}</div>
    </td>
  );
};
