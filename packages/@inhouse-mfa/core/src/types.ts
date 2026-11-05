import type { AnyRoute } from '@tanstack/react-router';
import type { ComponentType, ReactNode } from 'react';

interface RemotePluginRoutes {
  /** plugin 기능 라우트의 base path(예: '/recruit', '/members'). */
  basePath: string;
  /** pathless auth anchor route id. 기본 '/_auth'. */
  entry: string;
  /** remote 의 gen routeTree(root). */
  routeTree: AnyRoute;
}

export interface RemoteGlobalProps {
  children: ReactNode;
}

export interface RemoteGlobal {
  bootstrap?: () => (() => void) | Promise<(() => void) | void> | void;
  // React component export in the remote contract.
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Global?: ComponentType<RemoteGlobalProps>;
}

export interface RemotePlugin {
  global?: () => Promise<RemoteGlobal>;
  /** Module Federation remote 이름. mfa.config workspace name과 일치해야 해요. */
  name: string;
  routes: RemotePluginRoutes;
}
