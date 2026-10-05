import type { RemotePlugin } from '@inhouse-mfa/core';

import {
  type AppRouteTree,
  createExteriorApp,
  type CreateExteriorAppOptions,
} from '@exterior/core';
import { findRouteById } from '@inhouse-mfa/core';
import { type RouterConstructorOptions, type RouterHistory } from '@tanstack/react-router';

import { RemoteUnavailable } from './components/RemoteUnavailable';
import { composePlugins, type RemotePluginSpec } from './composePlugins';
import { RemoteRuntime } from './RemoteRuntime';

type SharedShellOptions = Pick<
  CreateExteriorAppOptions<AppRouteTree>,
  'appProvidersProps' | 'rootElement' | 'rootElementId'
>;

interface BootstrapShellOptions extends SharedShellOptions {
  /** shell 자기 routeTree 의 graft anchor id. 기본 '/_auth'. */
  authEntryId?: string;
  routerOptions?: Omit<
    RouterConstructorOptions<AppRouteTree, 'never', false, RouterHistory, Record<string, unknown>>,
    'context' | 'routeTree'
  >;
  routeTree: AppRouteTree;
  /** shell 이 조립할 remote spec 목록(mfa.config 에서 buildRemoteSpecs 로 파생). */
  specs: readonly RemotePluginSpec[];
}

interface BootstrapShellResult {
  app: ReturnType<typeof createExteriorApp<AppRouteTree>>;
  /** 로드에 실패한 plugin 이름들(unavailable UI 참고용). */
  failures: readonly string[];
  /** 성공적으로 graft 된 plugin 들. */
  plugins: readonly RemotePlugin[];
}

export const bootstrapShell = async (
  options: BootstrapShellOptions,
): Promise<BootstrapShellResult> => {
  const authEntryId = options.authEntryId ?? '/_auth';
  const shellAuth = findRouteById(options.routeTree, authEntryId);
  if (!shellAuth) {
    throw new Error(`[mfa-shell] shell entry route '${authEntryId}' not found`);
  }

  const { failures, plugins } = await composePlugins(shellAuth, options.specs);
  const InnerWrap = options.routerOptions?.InnerWrap;

  const app = createExteriorApp({
    appProvidersProps: options.appProvidersProps,
    children: () =>
      failures.length > 0 ? (
        <RemoteUnavailable availablePlugins={plugins.map((p) => p.name)} failedPlugins={failures} />
      ) : null,
    routeTree: options.routeTree,
    routerOptions: {
      ...options.routerOptions,
      InnerWrap: ({ children }) => (
        <RemoteRuntime plugins={plugins}>
          {InnerWrap ? <InnerWrap>{children}</InnerWrap> : children}
        </RemoteRuntime>
      ),
    },
    rootElement: options.rootElement,
    rootElementId: options.rootElementId,
  });

  void app.mount();

  return { app, failures, plugins };
};
