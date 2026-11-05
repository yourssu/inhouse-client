import clsx from 'clsx';

import * as styles from './Combobox.css';

interface ComboboxItemProps<T extends string> {
  highlighted: boolean;
  item: T;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseMove: () => void;
  selected: boolean;
}

export const ComboboxItem = <T extends string>({
  highlighted,
  item,
  onClick,
  onMouseEnter,
  onMouseMove,
  selected,
}: ComboboxItemProps<T>) => {
  return (
    <div
      className={clsx(
        styles.itemStyle({
          highlighted,
          selected,
        }),
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
    >
      {item}
    </div>
  );
};
