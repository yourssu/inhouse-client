import { defineRemotePlugin } from '@inhouse-mfa/core';
import { createRootRoute } from '@tanstack/react-router';
import { expect, test, vi } from 'vitest';

test('types remote declarations without requiring inferred metadata or running initialization', () => {
  const routeTree = createRootRoute();
  const bootstrap = vi.fn(() => () => {});
  const definition = defineRemotePlugin({
    routeTree,
    global: { bootstrap, Global: ({ children }) => children },
  });
  expect(definition.routeTree).toBe(routeTree);
  expect(bootstrap).not.toHaveBeenCalled();
  // @ts-expect-error routeTree is required.
  defineRemotePlugin({});
  // @ts-expect-error global is an object, not a module loader.
  defineRemotePlugin({ routeTree, global: async () => ({ bootstrap }) });
  // @ts-expect-error bootstrap must return void or a cleanup function.
  defineRemotePlugin({ routeTree, global: { bootstrap: () => 1 } });
  defineRemotePlugin({
    routeTree,
    // @ts-expect-error Global must accept children without additional required props.
    global: { Global: ({ required }: { required: string }) => required },
  });
});
