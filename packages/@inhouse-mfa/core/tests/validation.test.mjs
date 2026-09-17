import assert from 'node:assert/strict';
import test from 'node:test';

import { defineRemotePlugin, RouteRegistry } from '../dist/index.mjs';

const route = (id, children = []) => ({ children, options: { id } });
const plugin = (name, basePath, nestedRouteId) =>
  defineRemotePlugin({
    name,
    routes: {
      basePath,
      entry: '/_auth',
      routeTree: route('root', [
        route('/_auth', [route(basePath, nestedRouteId ? [route(nestedRouteId)] : [])]),
      ]),
    },
  });

test('validates remote route boundaries', () => {
  assert.equal(plugin('member', '/members').name, 'member');
  assert.throws(
    () =>
      defineRemotePlugin({
        name: 'broken',
        routes: {
          basePath: '/members',
          entry: '/_auth',
          routeTree: route('root', [route('/_auth', [route('/other')])]),
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

test('rejects duplicate nested route ids', () => {
  const registry = new RouteRegistry();
  registry.register(plugin('member', '/members', '/shared'));

  assert.throws(
    () => registry.assertPlugin(plugin('other', '/other', '/shared')),
    /route id '\/shared'/,
  );
});
