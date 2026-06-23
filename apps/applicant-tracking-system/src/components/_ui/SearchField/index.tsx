import { useState } from 'react';
import { IoMdCloseCircle } from 'react-icons/io';
import { LuSearch } from 'react-icons/lu';

import { cn, tv } from '@/utils/tw';

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

const container = tv({
  base: 'bg-greyOpacity100 flex items-center rounded-[10px]',
  variants: {
    variant: {
      dimmed: 'bg-greyOpacity100',
      outline:
        'border-grey200 focus-within:border-violet500 not-focus-within:hover:border-violetOpacity200 border bg-transparent transition-colors duration-200',
    },
    size: {
      md: 'h-8',
      lg: 'h-9.5',
    },
  },
});

const inputWrapper = tv({
  base: 'flex flex-[1_1_0] items-center',
  variants: {
    size: {
      md: 'h-8 p-1',
      lg: 'h-9.5 p-2 px-[7px]',
    },
  },
});

const input = tv({
  base: 'text-greyOpacity800 placeholder:text-greyOpacity500 w-full bg-transparent font-medium outline-0',
  variants: {
    size: {
      md: 'text-sm',
      lg: 'text-15',
    },
  },
});

const addon = tv({
  variants: {
    size: {
      md: 'p-1',
      lg: 'p-[7px]',
    },
    position: {
      left: 'pr-0',
      right: 'pl-0',
    },
  },
});

const iconWrapper = tv({
  variants: {
    size: {
      md: 'p-1',
      lg: 'px-[3px] py-1',
    },
  },
});

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
    <div className={cn(container({ variant, size }), className)}>
      <div className={addon({ size, position: 'left' })}>
        <div className={iconWrapper({ size })}>
          <LuSearch className="text-grey500 size-4 shrink-0" />
        </div>
      </div>
      <div className={inputWrapper({ size })}>
        <input
          className={input({ size })}
          defaultValue={defaultValue}
          onChange={handleChange}
          type="text"
          value={v}
          {...props}
        />
      </div>
      {showDeleteButton && (
        <div className={addon({ size, position: 'right' })}>
          <button
            className={cn(
              'text-greyOpacity500 ease-ease flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200',
              iconWrapper({ size }),
            )}
            onClick={handleDeleteClick}
            type="button"
          >
            <IoMdCloseCircle className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
};
