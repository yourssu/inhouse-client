import { tv } from '@/utils/tw';

const itemStyle = tv({
  base: 'text-15 mx-2 min-h-10 cursor-pointer rounded-lg p-2 font-medium outline-0',
  variants: {
    highlighted: {
      true: 'bg-greyOpacity100',
    },
    selected: {
      true: 'text-violet600',
      false: 'text-greyOpacity800',
    },
  },
  defaultVariants: {
    highlighted: false,
    selected: false,
  },
});

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
      className={itemStyle({
        highlighted,
        selected,
      })}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
    >
      {item}
    </div>
  );
};
