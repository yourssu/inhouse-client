import * as SelectPrimitive from '@radix-ui/react-select';
import clsx from 'clsx';
import { MdKeyboardArrowDown } from 'react-icons/md';

import { Fieldset } from '@/components/Fieldset';

import * as styles from './Select.css';

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
          <button
            className={clsx(
              styles.trigger({ variant, size, invalid, hasValue: !!value }),
              className,
            )}
          >
            <div
              style={{
                flex: '1 1 0%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'left',
              }}
            >
              <SelectPrimitive.Value placeholder={placeholder} />
            </div>
            <SelectPrimitive.Icon className={styles.triggerIcon}>
              <MdKeyboardArrowDown style={{ fontSize: 20 }} />
            </SelectPrimitive.Icon>
          </button>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={8}
            {...contentProps}
            className={clsx(styles.selectContent, contentProps?.className)}
          >
            <SelectPrimitive.Viewport className={styles.viewport}>
              {items.map((item) => (
                <SelectPrimitive.Item
                  className={styles.selectItem({ selected: item === value })}
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
