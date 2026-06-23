import { useId } from 'react';

import { cn, tv } from '@/utils/tw';

const checkbox = tv({
  slots: {
    base: 'group flex items-center gap-2',
    button:
      'flex shrink-0 cursor-pointer items-center justify-center rounded transition-colors duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-50',
    checkIcon: 'pointer-events-none',
    labelWrapper: 'flex items-center text-sm leading-[1.45] font-medium',
    labelText: 'text-grey800',
  },
  variants: {
    checked: {
      true: {
        button: 'bg-violet500 enabled:hover:bg-violet600',
      },
      false: {
        button:
          'border-greyOpacity300 enabled:hover:border-violet500 enabled:hover:bg-violetOpacity50 border bg-transparent',
      },
    },
  },
  defaultVariants: {
    checked: false,
  },
});

export interface CheckboxProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  label?: React.ReactNode;
  onCheckedChange?: (checked: boolean) => void;
  size?: number;
}

const CheckboxIcon = ({ size }: { size: number }) => {
  const { checkIcon } = checkbox();
  return (
    <span className={checkIcon()} data-state="checked">
      <svg
        fill="none"
        height={size}
        viewBox="0 0 16 16"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clipRule="evenodd"
          d="M11.9673 6.6403L7.71358 10.8948C7.57027 11.0371 7.3765 11.117 7.17453 11.117C6.97256 11.117 6.77878 11.0371 6.63548 10.8948L4.03282 8.29211C3.96208 8.22137 3.90596 8.13739 3.86768 8.04497C3.8294 7.95254 3.80969 7.85348 3.80969 7.75344C3.80969 7.5514 3.88995 7.35764 4.03282 7.21478C4.17568 7.07191 4.36944 6.99165 4.57148 6.99165C4.77352 6.99165 4.96729 7.07191 5.11015 7.21478L7.17415 9.27878L10.89 5.56297C10.9607 5.49223 11.0447 5.43612 11.1371 5.39783C11.2295 5.35955 11.3286 5.33984 11.4286 5.33984C11.5287 5.33984 11.6277 5.35955 11.7201 5.39783C11.8126 5.43612 11.8966 5.49223 11.9673 5.56297C12.038 5.63371 12.0941 5.71769 12.1324 5.81011C12.1707 5.90253 12.1904 6.00159 12.1904 6.10163C12.1904 6.20167 12.1707 6.30073 12.1324 6.39316C12.0941 6.48558 12.038 6.56956 11.9673 6.6403Z"
          fill="white"
          fillRule="evenodd"
        />
      </svg>
    </span>
  );
};

export const Checkbox = ({
  className,
  checked = false,
  onCheckedChange,
  label,
  id,
  size = 16,
  ...props
}: CheckboxProps) => {
  const { base, button, labelWrapper, labelText } = checkbox({ checked });

  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <div className={cn(base(), className)}>
      <button
        aria-checked={checked}
        className={cn(button())}
        id={checkboxId}
        onClick={() => onCheckedChange?.(!checked)}
        role="checkbox"
        style={{ width: size, height: size }}
        type="button"
        {...props}
      >
        {checked && <CheckboxIcon size={size} />}
      </button>
      {label && (
        <label className={labelWrapper()} htmlFor={checkboxId} tabIndex={-1}>
          <span className={labelText()}>{label}</span>
        </label>
      )}
    </div>
  );
};
