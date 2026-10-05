import type { RemotePlugin } from '@inhouse-mfa/core';
import type { PropsWithChildren } from 'react';

import { CatchBoundary, Outlet, useRouterState } from '@tanstack/react-router';
import { createContext, useContext } from 'react';

const RemoteContext = createContext<null | readonly RemotePlugin[]>(null);

const useActiveRemote = () => {
  const plugins = useContext(RemoteContext);
  const routeIds = useRouterState({
    select: (state) => state.matches.map((match) => match.routeId),
  });

  if (!plugins) {
    throw new Error('[mfa-shell] RemoteOutlet requires RemoteRuntime.');
  }

  return plugins.find((plugin) => {
    const prefix = `${plugin.routes.entry}${plugin.routes.basePath.replace(/\/$/, '')}`;
    return routeIds.some((id) => id === prefix || id.startsWith(`${prefix}/`));
  });
};

export const RemoteRuntime = ({
  children,
  plugins,
}: PropsWithChildren<{ plugins: readonly RemotePlugin[] }>) => (
  <RemoteContext.Provider value={plugins}>{children}</RemoteContext.Provider>
);

export const RemoteOutlet = () => {
  const plugin = useActiveRemote();
  const root = plugin?.routes.routeTree.options;
  const Root = root?.component ?? Outlet;
  const resetKey = useRouterState({ select: (state) => state.location.href });

  if (!plugin) {
    return <Outlet />;
  }

  if (!root?.errorComponent) {
    return <Root key={plugin.name} />;
  }

  return (
    <CatchBoundary
      errorComponent={root.errorComponent}
      getResetKey={() => resetKey}
      key={plugin.name}
    >
      <Root />
    </CatchBoundary>
  );
};
