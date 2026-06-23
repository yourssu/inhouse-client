import * as SelectPrimitive from '@radix-ui/react-select';
import clsx from 'clsx';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { MdKeyboardArrowDown } from 'react-icons/md';

import { HoverTooltip } from '@/components/_ui/HoverTooltip';
import { cn, tv } from '@/utils/tw';

type ThProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  align?: 'left' | 'right';
  infoContent?: string;
  ref?: React.Ref<HTMLTableCellElement>;
};

interface ThSelectProps<TValue extends string> {
  align?: 'left' | 'right';
  className?: string;
  infoContent?: string;
  items: Readonly<TValue[]>;
  onValueChange: (value: TValue) => void;
  placeholder: string;
  value: TValue | undefined;
}

const th = tv({
  base: 'text-neutralSubtle flex h-11 w-32 min-w-32 flex-[1_1] text-sm font-normal first-of-type:pl-2 first-of-type:*:justify-start last-of-type:pr-2',
  variants: {
    align: {
      left: 'justify-start! *:justify-start!',
      right: 'justify-end! *:justify-end!',
    },
  },
});

const thContent = tv({
  base: 'mx-1 flex w-full min-w-0 items-center justify-end overflow-hidden overflow-ellipsis whitespace-nowrap',
  variants: {
    select: {
      true: 'mr-0',
    },
  },
});

const trigger = tv({
  base: 'group ease-ease hover:bg-buttonTransparentBackgroundHovered flex h-fit cursor-pointer items-center justify-end rounded-lg px-1.5 py-0.5 pr-0 transition-colors duration-200',
  variants: {
    hasValue: {
      true: 'text-violet600 font-medium',
      false: 'text-neutralSubtle',
    },
  },
});

export const Th = ({
  children,
  className,
  infoContent,
  align,
  ...props
}: React.PropsWithChildren<ThProps>) => {
  return (
    <th className={cn(th({ align }), className)} {...props}>
      <div className={thContent()}>
        {children}
        {infoContent && (
          <HoverTooltip content={infoContent}>
            <AiOutlineQuestionCircle className="ml-1" />
          </HoverTooltip>
        )}
      </div>
    </th>
  );
};

export const ThSelect = <TValue extends string>({
  items,
  onValueChange,
  value,
  className,
  infoContent,
  placeholder,
  align,
}: ThSelectProps<TValue>) => {
  /* 
    NOTE: Radix-ui Select 컴포넌트의 값을 정확하게 초기화하려면 filter를 undefined 대신 ''로 설정해야 해요.
    이슈: https://github.com/radix-ui/primitives/issues/1569
    작업 PR: https://github.com/radix-ui/primitives/pull/2174
  */
  return (
    <th className={cn(th({ align }), className)}>
      <div className={thContent({ select: true })}>
        <SelectPrimitive.Root onValueChange={onValueChange} value={value ?? ''}>
          <SelectPrimitive.Trigger asChild>
            <button className={trigger({ hasValue: !!value })}>
              <SelectPrimitive.Value placeholder={placeholder} />
              {infoContent && (
                <HoverTooltip content={infoContent}>
                  <AiOutlineQuestionCircle className="ml-1" />
                </HoverTooltip>
              )}
              <SelectPrimitive.Icon
                className={clsx(value ? 'text-violet600' : 'text-neutralDisabled')}
              >
                <MdKeyboardArrowDown className="text-xl" />
              </SelectPrimitive.Icon>
            </button>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content align="end" position="popper" sideOffset={8}>
              <SelectPrimitive.Viewport className="bg-floatBackground shadow-select w-full min-w-30 rounded-lg py-2">
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
      </div>
    </th>
  );
};
