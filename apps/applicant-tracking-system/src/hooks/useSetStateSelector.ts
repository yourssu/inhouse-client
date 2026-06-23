import { set } from 'es-toolkit/compat';
import { produce } from 'immer';
import { type Dispatch, type SetStateAction, useCallback } from 'react';

import type { GetFieldTypeStrictly } from '@/types/misc';

import { getIn } from '@/utils/misc';

export const useSetStateSelector = <
  TObject extends object,
  TPath extends string = string,
  TValue = GetFieldTypeStrictly<TObject, TPath>,
>(
  setValue: Dispatch<SetStateAction<TObject>>,
  path: TPath,
) => {
  const result: Dispatch<SetStateAction<TValue>> = useCallback(
    (update) => {
      setValue((prevValue) =>
        produce(prevValue, (draft) => {
          set(
            draft,
            path,
            typeof update === 'function'
              ? (update as (prvValue: TValue) => TValue)(getIn(draft, path) as TValue)
              : update,
          );
        }),
      );
    },
    [path, setValue],
  );
  return result;
};
