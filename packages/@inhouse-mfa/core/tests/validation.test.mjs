import assert from 'node:assert/strict';
import test from 'node:test';

import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';

import {
  assertGraftCandidate,
  defineRemotePlugin,
  findRouteById,
  RouteRegistry,
} from '../dist/index.mjs';

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

/** graftPlugin의 반영 단계와 같은 방식으로 검증을 통과한 자식만 원본에 연결한다. */
const commitChildren = (hostEntry, pluginTree) => {
  const children = [...(findRouteById(pluginTree, '/_auth').children ?? [])];
  for (const child of children) {
    child.update({ getParentRoute: () => hostEntry });
  }
  hostEntry.addChildren([...(hostEntry.children ?? []), ...children]);
};

const hostTreeWithMembersDetails = () =>
  makeRouteTree([{ children: [{ fragment: '/details' }], fragment: '/members' }]);

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

test('graft candidate allows identical fragments under different basePaths', () => {
  const hostTree = hostTreeWithMembersDetails();
  const hostEntry = findRouteById(hostTree, '/_auth');

  assert.doesNotThrow(() => {
    assertGraftCandidate(hostEntry, plugin('scouter', '/recruit', ['/details', '/', '/$id']));
  });
});

test('graft candidate rejects a final id the shell already owns', () => {
  const hostTree = hostTreeWithMembersDetails();
  const hostEntry = findRouteById(hostTree, '/_auth');

  assert.throws(
    () => assertGraftCandidate(hostEntry, plugin('recruit', '/members/details')),
    /Duplicate routes found with id: \/_auth\/members\/details/,
  );
});

test('graft candidate rejects duplicate final ids inside a plugin', () => {
  const hostTree = hostTreeWithMembersDetails();
  const hostEntry = findRouteById(hostTree, '/_auth');

  const duplicateChildrenPlugin = defineRemotePlugin({
    name: 'dup',
    routes: {
      basePath: '/members',
      entry: '/_auth',
      routeTree: makeRouteTree([{ fragment: '/members' }, { fragment: '/members' }]),
    },
  });

  assert.throws(
    () => assertGraftCandidate(hostEntry, duplicateChildrenPlugin),
    /Duplicate routes found with id: \/_auth\/members/,
  );
});

test('graft candidate rejects routes outside the declared basePath', () => {
  const hostTree = hostTreeWithMembersDetails();
  const hostEntry = findRouteById(hostTree, '/_auth');

  // defineRemotePlugin의 정적 검사를 우회한 manifest를 runtime 방어로 잡는다.
  const wrongBasePathPlugin = {
    name: 'wrong',
    routes: {
      basePath: '/members',
      entry: '/_auth',
      routeTree: makeRouteTree([{ fragment: '/admin' }]),
    },
  };
  assert.throws(
    () => assertGraftCandidate(hostEntry, wrongBasePathPlugin),
    /route id '\/_auth\/admin' does not live under basePath '\/members'/,
  );

  const emptyEntryPlugin = {
    name: 'empty',
    routes: {
      basePath: '/members',
      entry: '/_auth',
      routeTree: makeRouteTree([]),
    },
  };
  assert.throws(
    () => assertGraftCandidate(hostEntry, emptyEntryPlugin),
    /entry route has no children to graft/,
  );
});

test('failed candidate leaves the existing tree and plugin routes untouched', () => {
  const hostTree = hostTreeWithMembersDetails();
  const hostEntry = findRouteById(hostTree, '/_auth');
  const conflicting = plugin('recruit', '/members/details');
  const pluginTree = conflicting.routes.routeTree;
  const pluginEntry = findRouteById(pluginTree, '/_auth');
  const pluginChild = pluginEntry.children[0];

  assert.throws(() => assertGraftCandidate(hostEntry, conflicting), /Duplicate routes found/);

  assert.equal(hostEntry.children.length, 1);
  assert.equal(pluginChild.options.getParentRoute(), pluginEntry);
  assert.equal(pluginChild.id, undefined);

  const hostRouter = createRouter({ routeTree: hostTree });
  assert.equal(hostRouter.routesById['/_auth/members/details'].id, '/_auth/members/details');

  // 실패한 plugin 원본도 자기 트리에서는 온전하게 동작한다.
  assert.doesNotThrow(() => createRouter({ routeTree: pluginTree }));
});

test('committed candidate merges cleanly and blocks later conflicting plugins', () => {
  const hostTree = hostTreeWithMembersDetails();
  const hostEntry = findRouteById(hostTree, '/_auth');
  const scouter = plugin('scouter', '/recruit', ['/details']);

  assertGraftCandidate(hostEntry, scouter);
  commitChildren(hostEntry, scouter.routes.routeTree);

  const mergedRouter = createRouter({ routeTree: hostTree });
  assert.equal(mergedRouter.routesById['/_auth/members/details'].id, '/_auth/members/details');
  assert.equal(mergedRouter.routesById['/_auth/recruit/details'].id, '/_auth/recruit/details');

  assert.throws(
    () => assertGraftCandidate(hostEntry, plugin('late', '/recruit/details')),
    /Duplicate routes found with id: \/_auth\/recruit\/details/,
  );
});
