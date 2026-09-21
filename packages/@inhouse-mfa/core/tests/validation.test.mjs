import assert from 'node:assert/strict';
import test from 'node:test';

import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';

import { defineRemotePlugin, findRouteById, RouteRegistry } from '../dist/index.mjs';

/** routeTree.gen.ts와 같은 방식: createRoute 후 update로 id와 path를 함께 지정한다. */
const makeRoute = (parent, spec) => {
  const route = createRoute({ getParentRoute: () => parent, path: spec.fragment }).update({
    id: spec.fragment,
    path: spec.fragment,
    getParentRoute: () => parent,
  });
  route.addChildren((spec.children ?? []).map((child) => makeRoute(route, child)));
  return route;
};

const makeRouteTree = (entryChildren) => {
  const root = createRootRoute();
  const auth = createRoute({ getParentRoute: () => root, id: '/_auth' });
  auth.addChildren(entryChildren.map((child) => makeRoute(auth, child)));
  root.addChildren([auth]);
  return root;
};

const plugin = (name, basePath, nested = []) =>
  defineRemotePlugin({
    name,
    routes: {
      basePath,
      entry: '/_auth',
      routeTree: makeRouteTree([
        { children: nested.map((fragment) => ({ fragment })), fragment: basePath },
      ]),
    },
  });

/** graft.ts와 같은 방식으로 plugin entry의 children을 host anchor 아래에 이식한다. */
const graftChildren = (hostTree, pluginTree) => {
  const anchor = findRouteById(hostTree, '/_auth');
  const children = [...(findRouteById(pluginTree, '/_auth').children ?? [])];
  for (const child of children) {
    child.update({ getParentRoute: () => anchor });
  }
  anchor.addChildren([...(anchor.children ?? []), ...children]);
};

test('validates remote route boundaries', () => {
  assert.equal(plugin('member', '/members').name, 'member');
  assert.throws(
    () =>
      defineRemotePlugin({
        name: 'broken',
        routes: {
          basePath: '/members',
          entry: '/_auth',
          routeTree: makeRouteTree([{ fragment: '/other' }]),
        },
      }),
    /does not live under basePath/,
  );
});

test('rejects duplicate plugin names and base paths', () => {
  const registry = new RouteRegistry();
  registry.register(plugin('member', '/members'));

  assert.equal(registry.hasPlugin('member'), true);
  assert.throws(() => registry.assertPlugin(plugin('member', '/other')), /plugin 'member'/);
  assert.throws(() => registry.assertPlugin(plugin('other', '/members')), /basePath '\/members'/);
});

test('allows identical nested fragments under different basePaths', () => {
  const registry = new RouteRegistry();
  registry.register(plugin('member', '/members', ['/details', '/', '/$id']));

  assert.doesNotThrow(() => {
    const scouter = plugin('scouter', '/recruit', ['/details', '/', '/$id']);
    registry.assertPlugin(scouter);
    registry.register(scouter);
  });
});

test('rejects grafted subtrees with the same final route id', () => {
  const registry = new RouteRegistry();
  registry.register(plugin('member', '/members', ['/details']));

  // basePath는 다르지만 graft 결과 routeTree의 최종 id가 '/_auth/members/details'로 겹친다.
  assert.throws(
    () => registry.assertPlugin(plugin('recruit', '/members/details')),
    /route id '\/_auth\/members\/details' is already grafted/,
  );
});

test('allowed fragment overlap yields distinct final ids in a real router', () => {
  const hostTree = makeRouteTree([{ children: [{ fragment: '/details' }], fragment: '/members' }]);
  graftChildren(
    hostTree,
    makeRouteTree([{ children: [{ fragment: '/details' }], fragment: '/recruit' }]),
  );

  const router = createRouter({ routeTree: hostTree });

  assert.equal(router.routesById['/_auth/members/details']?.id, '/_auth/members/details');
  assert.equal(router.routesById['/_auth/recruit/details']?.id, '/_auth/recruit/details');
});

test('real router rejects the same final id the registry rejects', () => {
  const hostTree = makeRouteTree([{ children: [{ fragment: '/details' }], fragment: '/members' }]);
  graftChildren(hostTree, makeRouteTree([{ fragment: '/members/details' }]));

  assert.throws(
    () => createRouter({ routeTree: hostTree }),
    /Duplicate routes found with id: \/_auth\/members\/details/,
  );
});
