import clsx from 'clsx';
import { useState } from 'react';
import { IoMdCloseCircle as CloseIcon } from 'react-icons/io';
import { LuSearch } from 'react-icons/lu';

import * as styles from './SearchField.css';

export interface SearchFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'defaultValue' | 'onChange' | 'size' | 'type' | 'value'
> {
  defaultValue?: string;
  onChange?: (v: string) => void;
  onDeleteClick?: () => void;
  size: 'lg' | 'md';
  value?: string;
  variant: 'dimmed' | 'outline';
}

export const SearchField = ({
  className,
  value,
  defaultValue,
  onDeleteClick,
  onChange,
  variant,
  size,
  ...props
}: SearchFieldProps) => {
  const [innerValue, setInnerValue] = useState<string>(defaultValue ?? '');

  const v = value ?? innerValue;
  const showDeleteButton = onDeleteClick && v && String(v).length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInnerValue(e.target.value);
    onChange?.(e.target.value);
  };

  const handleDeleteClick = () => {
    setInnerValue('');
    onChange?.('');
    onDeleteClick?.();
  };

  return (
    <div className={clsx(styles.container({ variant, size }), className)}>
      <div className={styles.addon({ size, position: 'left' })}>
        <div className={styles.iconWrapper({ size })}>
          <LuSearch className={styles.searchIcon} />
        </div>
      </div>
      <div className={styles.inputWrapper({ size })}>
        <input
          className={styles.input({ size })}
          defaultValue={defaultValue}
          onChange={handleChange}
          type="text"
          value={v}
          {...props}
        />
      </div>
      {showDeleteButton && (
        <div className={styles.addon({ size, position: 'right' })}>
          <button
            className={clsx(styles.deleteButton, styles.iconWrapper({ size }))}
            onClick={handleDeleteClick}
            type="button"
          >
            <CloseIcon className={styles.deleteIcon} />
          </button>
        </div>
      )}
    </div>
  );
};
