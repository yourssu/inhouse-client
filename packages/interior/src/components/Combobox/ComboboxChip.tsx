import { MdClose } from 'react-icons/md';

import * as styles from './Combobox.css';

interface ComboboxChipProps<T extends string> {
  item: T;
  onRemove: (item: T) => void;
}

export const ComboboxChip = <T extends string>({ item, onRemove }: ComboboxChipProps<T>) => {
  return (
    <span className={styles.chip}>
      {item}
      <button
        className={styles.chipCloseButton}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item);
        }}
        type="button"
      >
        <MdClose />
      </button>
    </span>
  );
};
