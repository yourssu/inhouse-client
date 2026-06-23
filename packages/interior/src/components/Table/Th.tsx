import * as SelectPrimitive from '@radix-ui/react-select';
import { vars } from '@yourssu-inhouse/interior-vars';
import clsx from 'clsx';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { MdKeyboardArrowDown } from 'react-icons/md';

import { HoverTooltip } from '../HoverTooltip';
import * as selectStyles from '../Select/Select.css';
import { useTableContext } from './context';
import * as styles from './Table.css';

type ThProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  align?: 'left' | 'right';
  infoContent?: string;
  ref?: React.Ref<HTMLTableCellElement>;
};

export interface ThSelectProps<TValue extends string> {
  align?: 'left' | 'right';
  className?: string;
  infoContent?: string;
  items: Readonly<TValue[]>;
  onValueChange: (value: TValue) => void;
  placeholder: string;
  value: TValue | undefined;
}

export const Th = ({
  children,
  className,
  infoContent,
  align,
  ...props
}: React.PropsWithChildren<ThProps>) => {
  const { stickyHorizontal, showStickyShadow } = useTableContext();

  return (
    <th
      className={clsx(styles.thRecipe({ align, stickyHorizontal, showStickyShadow }), className)}
      {...props}
    >
      <div className={styles.thContent({ align })}>
        {children}
        {infoContent && (
          <HoverTooltip content={infoContent}>
            <AiOutlineQuestionCircle style={{ marginLeft: 4 }} />
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
  const { stickyHorizontal, showStickyShadow } = useTableContext();
  /* 
    NOTE: Radix-ui Select 컴포넌트의 값을 정확하게 초기화하려면 filter를 undefined 대신 ''로 설정해야 해요.
    이슈: https://github.com/radix-ui/primitives/issues/1569
    작업 PR: https://github.com/radix-ui/primitives/pull/2174
  */
  return (
    <th className={clsx(styles.thRecipe({ align, stickyHorizontal, showStickyShadow }), className)}>
      <div className={styles.thContent({ select: true, align })}>
        <SelectPrimitive.Root onValueChange={onValueChange} value={value ?? ''}>
          <SelectPrimitive.Trigger asChild>
            <button className={styles.thSelectTrigger({ hasValue: !!value })}>
              <SelectPrimitive.Value placeholder={placeholder} />
              {infoContent && (
                <HoverTooltip content={infoContent}>
                  <AiOutlineQuestionCircle style={{ marginLeft: 4 }} />
                </HoverTooltip>
              )}
              <SelectPrimitive.Icon
                style={{
                  color: value ? vars.color.violet600 : vars.color.neutralDisabled,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <MdKeyboardArrowDown style={{ fontSize: 20 }} />
              </SelectPrimitive.Icon>
            </button>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              align="end"
              className={selectStyles.selectContent}
              position="popper"
              sideOffset={8}
            >
              <SelectPrimitive.Viewport
                className={selectStyles.viewport}
                style={{ maxHeight: 'unset' }}
              >
                {items.map((item) => (
                  <SelectPrimitive.Item
                    className={selectStyles.selectItem({ selected: item === value })}
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
