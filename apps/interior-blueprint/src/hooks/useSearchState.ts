import { trimPathRight, useMatches, useNavigate, useSearch } from '@tanstack/react-router';
import { assert } from 'es-toolkit';
import { type Dispatch, type SetStateAction, useMemo } from 'react';

import type { RouteId, Search } from '@/types/route';

interface UseSearchStateProps<
  TFrom extends RouteId,
  TDeserialized extends Record<string, unknown>,
> {
  deserialize?: (search: Search<TFrom>) => TDeserialized;
  from: TFrom;
  serialize?: (search: TDeserialized) => Search<TFrom>;
}

const useRoutePathById = (pathId: RouteId) => {
  const matches = useMatches();
  const path = matches.find((match) => match.routeId === pathId)?.fullPath;
  assert(!!path, `해당 id가 라우트 트리에 없어요. '${pathId}'`);
  return path;
};

export const useSearchState = <
  TFrom extends RouteId,
  TDeserialized extends Record<string, unknown> = Search<TFrom>,
>({
  from,
  serialize = (v) => v,
  deserialize = (v) => v as TDeserialized,
}: UseSearchStateProps<TFrom, TDeserialized>) => {
  const search = useSearch({ from });
  const routePath = useRoutePathById(from);
  const navigate = useNavigate({ from: routePath });

  const searchState = useMemo(() => deserialize(search), [search, deserialize]);

  const setSearchParamsWrapper: Dispatch<SetStateAction<TDeserialized>> = (nextInit) => {
    navigate({
      to: trimPathRight(routePath),
      search: (prev) =>
        serialize(
          typeof nextInit === 'function' ? nextInit(deserialize(prev as Search<TFrom>)) : nextInit,
        ) as typeof prev,
    });
  };

  return [searchState, setSearchParamsWrapper] as const;
};
