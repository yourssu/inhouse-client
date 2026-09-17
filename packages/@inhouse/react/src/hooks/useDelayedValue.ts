import { startTransition, useDeferredValue, useEffect, useState } from 'react';
import { useDebounce } from 'react-simplikit';

export function useDelayedValue<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  const setter = useDebounce((v: T) => {
    startTransition(() => setDebouncedValue(v));
  }, delay ?? 300);

  useEffect(() => {
    setter(value);
  }, [value, setter]);

  return useDeferredValue(debouncedValue);
}
