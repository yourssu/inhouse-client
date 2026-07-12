import * as PopoverPrimitive from '@radix-ui/react-popover';
import clsx from 'clsx';
import { disassemble } from 'es-hangul';
import { useRef, useState } from 'react';

import { Fieldset } from '@/components/Fieldset';

import * as styles from './Combobox.css';
import { ComboboxChip } from './ComboboxChip';
import { ComboboxItem } from './ComboboxItem';

export interface ComboboxProps<TValue extends string> {
  className?: string;
  description?: string;
  disabled?: boolean;
  items: Readonly<TValue[]>;
  label?: string;
  onOpenChange?: (v: boolean) => void;
  onValueChange: (value: TValue[]) => void;
  placeholder?: string;
  value: TValue[];
}

export const Combobox = <TValue extends string>({
  className,
  description,
  disabled,
  items,
  label,
  onOpenChange,
  onValueChange,
  placeholder,
  value,
}: ComboboxProps<TValue>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = items.filter((item) => {
    const normalizedItem = item.normalize('NFC').toLowerCase();
    const normalizedInput = inputValue.normalize('NFC').toLowerCase();

    if (normalizedItem.includes(normalizedInput)) {
      return true;
    }

    const disassembledItem = disassemble(normalizedItem);
    const disassembledInput = disassemble(normalizedInput);
    return disassembledItem.includes(disassembledInput);
  });

  const removeItem = (item: TValue) => {
    onValueChange(value.filter((v) => v !== item));
  };

  const toggleItem = (item: TValue) => {
    if (value.includes(item)) {
      removeItem(item);
    } else {
      onValueChange([...value, item]);
      setInputValue('');
    }
  };

  const handleBackspace = () => {
    if (inputValue === '' && value.length > 0) {
      removeItem(value[value.length - 1]);
    }
  };

  const handleArrowDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!isOpen) {
      setIsOpen(true);
      onOpenChange?.(true);
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
    }
  };

  const handleArrowUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (isOpen) {
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleEnterOrSpace = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || highlightedIndex === -1) {
      return;
    }

    e.preventDefault();

    const item = filteredItems[highlightedIndex];
    if (!item) {
      return;
    }
    toggleItem(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case ' ':
      case 'Enter':
        handleEnterOrSpace(e);
        break;
      case 'ArrowDown':
        handleArrowDown(e);
        break;
      case 'ArrowUp':
        handleArrowUp(e);
        break;
      case 'Backspace':
        handleBackspace();
        break;
    }
  };

  return (
    <Fieldset help={description} label={label}>
      <PopoverPrimitive.Root
        onOpenChange={(open) => {
          setIsOpen(open);
          onOpenChange?.(open);
          if (!open) {
            setHighlightedIndex(0);
          }
        }}
        open={isOpen}
      >
        <PopoverPrimitive.Trigger
          asChild
          onClick={(e) => {
            e.preventDefault();
            if (!disabled) {
              setIsOpen(true);
              onOpenChange?.(true);
              inputRef.current?.focus();
            }
          }}
        >
          <div
            className={clsx(styles.trigger({ disabled }), className)}
            onClick={() => {
              if (!disabled) {
                setIsOpen(true);
                onOpenChange?.(true);
                inputRef.current?.focus();
              }
            }}
          >
            {value.map((item) => (
              <ComboboxChip
                item={item}
                key={item}
                onRemove={(v) => {
                  removeItem(v);
                  inputRef.current?.focus();
                }}
              />
            ))}
            <input
              className={styles.input}
              disabled={disabled}
              onChange={(e) => {
                setInputValue(e.target.value);
                setIsOpen(true);
                onOpenChange?.(true);
                setHighlightedIndex(0);
              }}
              onFocus={() => {
                setIsOpen(true);
                onOpenChange?.(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder={value.length === 0 ? placeholder : ''}
              ref={inputRef}
              type="text"
              value={inputValue}
            />
          </div>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            className={styles.popoverContent}
            onOpenAutoFocus={(e) => e.preventDefault()}
            sideOffset={8}
          >
            <div className={styles.menu}>
              {filteredItems.length === 0 ? (
                <div className={styles.noResult}>검색 결과가 없습니다.</div>
              ) : (
                filteredItems.map((item, index) => (
                  <ComboboxItem
                    highlighted={highlightedIndex === index}
                    item={item}
                    key={item}
                    onClick={() => {
                      toggleItem(item);
                      inputRef.current?.focus();
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseMove={() => {
                      if (highlightedIndex !== index) {
                        setHighlightedIndex(index);
                      }
                    }}
                    selected={value.includes(item)}
                  />
                ))
              )}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </Fieldset>
  );
};
