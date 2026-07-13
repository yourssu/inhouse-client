import type { RemotePlugin } from '@yourssu-inhouse/mfa-core';

import {
  createRouter,
  type RouterConstructorOptions,
  type RouterHistory,
} from '@tanstack/react-router';
import {
  type AppRouteTree,
  createExteriorApp,
  type CreateExteriorAppOptions,
} from '@yourssu-inhouse/exterior';
import { findRouteById, runPluginInits, setupPluginMocks } from '@yourssu-inhouse/mfa-core';

import { RemoteUnavailable } from './components/RemoteUnavailable';
import { composePlugins, type RemotePluginSpec } from './composePlugins';
import { assertSharedVersions } from './sharedCheck';

type SharedShellOptions = Pick<
  CreateExteriorAppOptions<unknown>,
  'appProvidersProps' | 'queryClientConfig' | 'rootElement' | 'rootElementId'
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

type ShellRouter = ReturnType<typeof createRouter<AppRouteTree>>;

interface BootstrapShellResult {
  app: ReturnType<typeof createExteriorApp<ShellRouter>>;
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

  await assertSharedVersions();

  const { failures, plugins } = await composePlugins(shellAuth, options.specs);

  const app = createExteriorApp({
    appProvidersProps: options.appProvidersProps,
    beforeRender: async () => {
      await runPluginInits(plugins, 'shell');
      await setupPluginMocks(plugins, 'shell');
    },
    children: () =>
      failures.length > 0 ? (
        <RemoteUnavailable availablePlugins={plugins.map((p) => p.name)} failedPlugins={failures} />
      ) : null,
    createRouter: (queryClient) =>
      createRouter({
        routeTree: options.routeTree,
        context: { queryClient },
        ...options.routerOptions,
      }),
    queryClientConfig: options.queryClientConfig,
    rootElement: options.rootElement,
    rootElementId: options.rootElementId,
  });

  void app.mount();

  return { app, failures, plugins };
};
