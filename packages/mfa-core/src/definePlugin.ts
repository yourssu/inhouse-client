import type { RemotePlugin } from './types';

import { validatePlugin } from './validation';

export interface DefineRemotePluginOptions {
  capabilities?: RemotePlugin['capabilities'];
  lifecycle?: RemotePlugin['lifecycle'];
  name: string;
  routes: RemotePlugin['routes'];
}

/*
  remote Plugin manifest 생성 헬퍼. routes.entry 자식을 찾아 basePath 위반·누락을 정의
  시점에 검증(validatePlugin) 하고 RemotePlugin 객체로 반환해요. remote 마다
  findAuthRoute(routeTree as AnyRoute) as AnyRoute + 중복 검사를 없애요.
*/
export const defineRemotePlugin = (options: DefineRemotePluginOptions): RemotePlugin => {
  const plugin: RemotePlugin = {
    capabilities: options.capabilities,
    lifecycle: options.lifecycle,
    name: options.name,
    routes: options.routes,
  };
  validatePlugin(plugin);
  return plugin;
};
