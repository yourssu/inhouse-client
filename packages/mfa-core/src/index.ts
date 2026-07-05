export { envKeyForRemote, type MfaConfig, type MfaRemoteEntry, remoteEntryDevUrl } from './config';
export { defineRemotePlugin } from './definePlugin';
export type { DefineRemotePluginOptions } from './definePlugin';
export { runPluginInits, setupPluginMocks } from './lifecycle';
export { pluginQueryKey } from './queryKey';
export {
  buildFederationShared,
  type FederationSharedConfig,
  SHARED_DEPS,
  type SharedDepPolicy,
  SINGLETON_CONTEXT_PACKAGES,
} from './shared';
export type {
  ExteriorAppMode,
  PluginRuntimeContext,
  RemotePlugin,
  RemotePluginCapabilities,
  RemotePluginLifecycle,
  RemotePluginRoutes,
} from './types';
export {
  collectRouteIds,
  findPluginEntryRoute,
  findRouteById,
  RouteRegistry,
  validatePlugin,
} from './validation';
