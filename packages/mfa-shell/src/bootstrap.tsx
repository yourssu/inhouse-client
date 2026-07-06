import type { RemotePlugin } from '@yourssu-inhouse/mfa-core';

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
  CreateExteriorAppOptions<AppRouteTree>,
  'appProvidersProps' | 'queryClientConfig' | 'rootElement' | 'rootElementId' | 'routerOptions'
>;

interface BootstrapShellOptions extends SharedShellOptions {
  /** shell 자기 routeTree 의 graft anchor id. 기본 '/_auth'. */
  authEntryId?: string;
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

/*
  shell 을 runtime orchestrator 로 부트스트랩해요. Module Federation 으로 remote Plugin 들을
  로드하고 Plugin 계약으로만 composition(graft) 을 수행해요. remote 내부 route 구조를 직접
  탐색하지 않아요.

  1. shell 자기 entry route(anchor)를 찾아요.
  2. assertSharedVersions 로 shared dependency 버전 정책을 런타임에 검사해요.
  3. composePlugins 가 각 plugin 의 entry children 을 shell entry 아래로 graft 해요(per-plugin
     격리, route id/basePath 충돌 검사).
  4. createExteriorApp 의 beforeRender 에서 init · mocks lifecycle 을 태워요.
  5. failures 가 있으면 unavailable UI 를 children slot 에 렌더해요.
*/
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

  const app = createExteriorApp<AppRouteTree>({
    appProvidersProps: options.appProvidersProps,
    beforeRender: async () => {
      await runPluginInits(plugins, 'shell');
      await setupPluginMocks(plugins, 'shell');
    },
    children: () =>
      failures.length > 0 ? (
        <RemoteUnavailable availablePlugins={plugins.map((p) => p.name)} failedPlugins={failures} />
      ) : null,
    queryClientConfig: options.queryClientConfig,
    rootElement: options.rootElement,
    rootElementId: options.rootElementId,
    routerOptions: options.routerOptions,
    routeTree: options.routeTree,
  });

  void app.mount();

  return { app, failures, plugins };
};
