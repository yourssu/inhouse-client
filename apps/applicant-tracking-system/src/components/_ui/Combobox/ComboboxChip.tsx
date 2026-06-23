import { MdClose } from 'react-icons/md';

interface ComboboxChipProps<T extends string> {
  item: T;
  onRemove: (item: T) => void;
}

export const ComboboxChip = <T extends string>({ item, onRemove }: ComboboxChipProps<T>) => {
  return (
    <span className="bg-greyOpacity100 flex h-7 items-center gap-1 rounded-lg px-2 py-0.5 text-sm font-medium">
      {item}
      <button
        className="hover:bg-greyOpacity200 flex cursor-pointer items-center justify-center rounded-full p-0.5"
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
