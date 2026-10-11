import { createRootRoute } from '@tanstack/react-router';
import assert from 'node:assert/strict';
import test from 'node:test';

import { loadRemoteModules, type RemoteModule } from './loadRemoteModules';

test('starts every remote concurrently and retains configuration order', async () => {
  const started: string[] = [];
  const pending = new Map<string, (module: RemoteModule) => void>();
  const first = { routeTree: createRootRoute() };
  const second = { routeTree: createRootRoute() };
  const loaded = loadRemoteModules([{ name: 'first' }, { name: 'second' }], (id) => {
    started.push(id);
    return new Promise((resolve) => pending.set(id, resolve));
  });

  assert.deepEqual(started, ['first/route', 'second/route']);
  pending.get('second/route')?.(second);
  pending.get('first/route')?.(first);
  assert.deepEqual(await loaded, [
    { status: 'fulfilled', value: first },
    { status: 'fulfilled', value: second },
  ]);
});

test('bounds unavailable remotes without losing healthy results or late rejection handling', async () => {
  let rejectLate: ((reason: Error) => void) | undefined;
  const module = { routeTree: createRootRoute() };
  const results = await loadRemoteModules(
    [{ name: 'offline' }, { name: 'healthy' }, { name: 'late' }],
    async (id) => {
      if (id.startsWith('healthy/')) {
        return module;
      }
      if (id.startsWith('late/')) {
        return new Promise((_, reject) => {
          rejectLate = reject;
        });
      }
      throw new Error('offline');
    },
    10,
  );

  assert.equal(results[0].status, 'rejected');
  assert.deepEqual(results[1], { status: 'fulfilled', value: module });
  assert.equal(results[2].status, 'rejected');
  if (results[2].status === 'rejected') {
    assert.match(String(results[2].reason), /'late' load timed out after 10ms/);
  }
  rejectLate?.(new Error('late network failure'));
  await new Promise((resolve) => setImmediate(resolve));
});
