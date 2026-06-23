import * as SelectPrimitive from '@radix-ui/react-select';
import clsx from 'clsx';
import { MdKeyboardArrowDown } from 'react-icons/md';

import { Fieldset } from '@/components/_ui/Fieldset';
import { cn, tv } from '@/utils/tw';

export interface SelectProps<TValue extends string> {
  className?: string;
  contentProps?: SelectPrimitive.SelectContentProps;
  description?: React.ReactNode;
  disabled?: boolean;
  invalid?: boolean;
  items: Readonly<TValue[]>;
  label?: React.ReactNode;
  onValueChange: (value: TValue) => void;
  placeholder: string;
  size: 'lg' | 'md' | 'sm' | 'xs';
  value: TValue | undefined;
  variant: 'dimmed' | 'inline' | 'outline';
}

const trigger = tv({
  base: 'group ease-ease disabled:text-greyOpacity300 flex cursor-pointer items-center justify-between rounded-lg transition-colors duration-200 disabled:cursor-not-allowed',
  variants: {
    variant: {
      outline:
        'shadow-select-outline enabled:hover:shadow-select-outline-hover py-2 pr-[11px] pl-4 transition-shadow',
      dimmed: 'enabled:hover:bg-greyOpacity200 bg-greyOpacity100 py-2 pr-[11px] pl-4',
      inline: 'enabled:hover:bg-buttonTransparentBackgroundHovered',
    },
    size: {
      xs: 'text-13 h-6 pr-1 pl-2.5',
      sm: 'text-13 h-7 pr-1.5 pl-3',
      md: 'h-8 pr-2 pl-3 text-sm',
      lg: 'text-15 h-9.5 pr-[11px] pl-4',
    },
    hasValue: {
      true: 'text-greyOpacity800',
      false: 'text-grey400',
    },
    invalid: {
      true: 'border-red500',
      false: 'border-grey200',
    },
  },
  defaultVariants: {
    variant: 'inline',
    invalid: false,
  },
});

export const Select = <TValue extends string>({
  items,
  onValueChange,
  value,
  className,
  invalid,
  placeholder,
  disabled,
  size,
  variant,
  contentProps,
  label,
  description,
}: React.PropsWithChildren<SelectProps<TValue>>) => {
  /* 
    NOTE: Radix-ui Select 컴포넌트의 값을 정확하게 초기화하려면 filter를 undefined 대신 ''로 설정해야 해요.
    이슈: https://github.com/radix-ui/primitives/issues/1569
    작업 PR: https://github.com/radix-ui/primitives/pull/2174
  */
  return (
    <Fieldset help={description} label={label}>
      <SelectPrimitive.Root onValueChange={onValueChange} value={value ?? ''}>
        <SelectPrimitive.Trigger asChild disabled={disabled}>
          <button className={cn(trigger({ variant, size, invalid, hasValue: !!value }), className)}>
            <div className="flex-1 truncate text-left">
              <SelectPrimitive.Value placeholder={placeholder} />
            </div>
            <SelectPrimitive.Icon className="text-neutralDisabled group-disabled:text-greyOpacity300 ml-1">
              <MdKeyboardArrowDown className="text-xl" />
            </SelectPrimitive.Icon>
          </button>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={8}
            {...contentProps}
            className={cn('z-50', contentProps?.className)}
          >
            <SelectPrimitive.Viewport className="bg-floatBackground shadow-select max-h-80 w-full min-w-30 rounded-lg py-2">
              {items.map((item) => (
                <SelectPrimitive.Item
                  className={clsx(
                    'text-15 hover:bg-greyOpacity100 mx-2 min-h-10 cursor-pointer rounded-lg p-2 font-medium outline-0',
                    item === value ? 'text-violet600' : 'text-greyOpacity800',
                  )}
                  key={item}
                  value={item}
                >
                  <SelectPrimitive.ItemText>{item}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </Fieldset>
  );
};
