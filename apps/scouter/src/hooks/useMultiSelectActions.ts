import { useCallback, useState } from 'react';

interface UseMultiSelectActionsReturn<K extends number | string> {
  clear: () => void;
  isAllSelected: (filteredIds: K[]) => boolean;
  isSelected: (id: K) => boolean;
  selectedIds: Set<K>;
  toggle: (id: K, checked: boolean) => void;
  toggleAll: (filteredIds: K[], checked: boolean) => void;
}

export const useMultiSelectActions = <
  K extends number | string,
>(): UseMultiSelectActionsReturn<K> => {
  const [selectedIds, setSelectedIds] = useState<Set<K>>(() => new Set());

  const isSelected = useCallback((id: K) => selectedIds.has(id), [selectedIds]);

  const isAllSelected = useCallback(
    (filteredIds: K[]) => filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id)),
    [selectedIds],
  );

  const toggle = useCallback((id: K, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback((filteredIds: K[], checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        filteredIds.forEach((id) => next.add(id));
      } else {
        filteredIds.forEach((id) => next.delete(id));
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    selectedIds,
    isSelected,
    isAllSelected,
    toggle,
    toggleAll,
    clear,
  };
};
