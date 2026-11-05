/// <reference lib="es2024.promise" />

import assert from 'node:assert/strict';
import test from 'node:test';

import { createRemoteGlobalLifecycle } from './remoteGlobalLifecycle';

test('deduplicates preparation and waits for bootstrap before publishing ready', async () => {
  const started = Promise.withResolvers<void>();
  const finish = Promise.withResolvers<void>();
  const events: string[] = [];
  const global = {
    bootstrap: async () => {
      events.push('start');
      started.resolve();
      await finish.promise;
      return () => events.push('stop');
    },
  };
  const lifecycle = createRemoteGlobalLifecycle(async () => global);
  const first = lifecycle.prepare();
  assert.equal(first, lifecycle.prepare());
  await started.promise;
  assert.equal(lifecycle.getSnapshot().status, 'pending');
  finish.resolve();
  assert.equal(await first, global);
  assert.equal(lifecycle.getSnapshot().status, 'ready');
  await lifecycle.release();
  await lifecycle.release();
  assert.deepEqual(events, ['start', 'stop']);
});

test('skips immediately cancelled preparations', async () => {
  let starts = 0;
  const lifecycle = createRemoteGlobalLifecycle(async () => ({
    bootstrap: () => {
      starts += 1;
    },
  }));
  const cancelled = lifecycle.prepare();
  await lifecycle.release();
  assert.equal(await cancelled, undefined);
  await lifecycle.prepare();
  assert.equal(starts, 1);
  await lifecycle.release();
});

test('does not bootstrap an import that finishes after exit', async () => {
  const importing = Promise.withResolvers<void>();
  const imported = Promise.withResolvers<{ bootstrap: () => void }>();
  let starts = 0;
  const lifecycle = createRemoteGlobalLifecycle(() => {
    importing.resolve();
    return imported.promise;
  });
  const cancelled = lifecycle.prepare();
  await importing.promise;
  const stopped = lifecycle.release();
  imported.resolve({
    bootstrap: () => {
      starts += 1;
    },
  });
  await stopped;
  assert.equal(await cancelled, undefined);
  assert.equal(starts, 0);
});

test('finishes cleanup before a re-entry starts another bootstrap', async () => {
  const started = Promise.withResolvers<void>();
  const finish = Promise.withResolvers<void>();
  const events: string[] = [];
  const lifecycle = createRemoteGlobalLifecycle(async () => ({
    bootstrap: async () => {
      const index = events.filter((event) => event.startsWith('start')).length + 1;
      events.push(`start:${index}`);
      started.resolve();
      await finish.promise;
      return () => events.push(`stop:${index}`);
    },
  }));
  const cancelled = lifecycle.prepare();
  await started.promise;
  const stopped = lifecycle.release();
  const next = lifecycle.prepare();
  assert.deepEqual(events, ['start:1']);
  finish.resolve();
  await Promise.all([cancelled, stopped, next]);
  assert.deepEqual(events, ['start:1', 'stop:1', 'start:2']);
  await lifecycle.release();
  assert.deepEqual(events, ['start:1', 'stop:1', 'start:2', 'stop:2']);
});

test('can retry import and bootstrap failures after release', async () => {
  for (const kind of ['import', 'bootstrap']) {
    let fail = true;
    const lifecycle = createRemoteGlobalLifecycle(async () => {
      if (kind === 'import' && fail) {
        throw new Error(kind);
      }
      return {
        bootstrap: () => {
          if (fail) {
            throw new Error(kind);
          }
        },
      };
    });
    await assert.rejects(lifecycle.prepare(), new RegExp(kind));
    assert.equal(lifecycle.getSnapshot().status, 'error');
    await lifecycle.release();
    fail = false;
    await lifecycle.prepare();
    assert.equal(lifecycle.getSnapshot().status, 'ready');
    await lifecycle.release();
  }
});

test('HMR cleans up the previous bootstrap and installs the new one', async () => {
  const events: string[] = [];
  const first = {
    bootstrap: () => {
      events.push('first');
      return () => events.push('stop:first');
    },
  };
  const second = {
    bootstrap: () => {
      events.push('second');
      return () => events.push('stop:second');
    },
  };
  const lifecycle = createRemoteGlobalLifecycle(async () => first);
  await lifecycle.prepare();
  await lifecycle.update(second);
  assert.deepEqual(events, ['first', 'stop:first', 'second']);
  await lifecycle.release();
  assert.deepEqual(events, ['first', 'stop:first', 'second', 'stop:second']);
});

test('component-only updates preserve bootstrap and the installation revision', async () => {
  let starts = 0;
  const first = {
    bootstrap: () => {
      starts += 1;
    },
    Global: () => null,
  };
  const lifecycle = createRemoteGlobalLifecycle(async () => first);
  await lifecycle.prepare();
  const revision = lifecycle.getSnapshot().revision;
  const next = { ...first, Global: () => null };
  await lifecycle.update(next);
  assert.equal(starts, 1);
  assert.equal(lifecycle.getSnapshot().revision, revision);
  assert.deepEqual(lifecycle.getSnapshot(), { status: 'ready', revision, global: next });
  await lifecycle.release();
});

test('inactive HMR only records the newest module for the next entry', async () => {
  let starts = 0;
  const lifecycle = createRemoteGlobalLifecycle(async () =>
    assert.fail('obsolete module imported'),
  );
  await lifecycle.update({
    bootstrap: () => {
      starts += 1;
    },
  });
  assert.equal(starts, 0);
  assert.equal(lifecycle.getSnapshot().status, 'idle');
  await lifecycle.prepare();
  assert.equal(starts, 1);
  await lifecycle.release();
});

test('coalesces HMR during bootstrap and does not resurrect an exited service', async () => {
  const started = Promise.withResolvers<void>();
  const finish = Promise.withResolvers<void>();
  const events: string[] = [];
  const lifecycle = createRemoteGlobalLifecycle(async () => ({
    bootstrap: async () => {
      events.push('start:old');
      started.resolve();
      await finish.promise;
      return () => events.push('stop:old');
    },
  }));
  const initial = lifecycle.prepare();
  await started.promise;
  const updated = lifecycle.update({
    bootstrap: () => {
      events.push('obsolete');
    },
  });
  await lifecycle.update({
    bootstrap: () => {
      events.push('latest');
    },
  });
  finish.resolve();
  await Promise.all([initial, updated]);
  assert.deepEqual(events, ['start:old', 'stop:old', 'latest']);
  await lifecycle.release();

  const secondStarted = Promise.withResolvers<void>();
  const secondFinish = Promise.withResolvers<void>();
  await lifecycle.update({
    bootstrap: async () => {
      secondStarted.resolve();
      await secondFinish.promise;
    },
  });
  const second = lifecycle.prepare();
  await secondStarted.promise;
  const change = lifecycle.update({ bootstrap: () => assert.fail('service resurrected') });
  const leave = lifecycle.release();
  secondFinish.resolve();
  await Promise.all([second, change, leave]);
  assert.equal(lifecycle.getSnapshot().status, 'idle');
});

test('reports cleanup failure once and permits re-entry from idle', async (context) => {
  const error = new Error('cleanup failed');
  const report = context.mock.method(console, 'error', () => {});
  let starts = 0;
  const lifecycle = createRemoteGlobalLifecycle(
    async () => ({
      bootstrap: () => {
        starts += 1;
        return () => {
          throw error;
        };
      },
    }),
    'fixture',
  );
  await lifecycle.prepare();
  await lifecycle.release();
  await lifecycle.release();
  assert.equal(lifecycle.getSnapshot().status, 'idle');
  assert.equal(report.mock.callCount(), 1);
  assert.deepEqual(report.mock.calls[0].arguments, ["[mfa-shell] 'fixture' cleanup failed", error]);
  await lifecycle.prepare();
  assert.equal(starts, 2);
  assert.equal(lifecycle.getSnapshot().status, 'ready');
  await lifecycle.release();
});

test('reports late cancelled cleanup failure and initializes the queued re-entry', async (context) => {
  const report = context.mock.method(console, 'error', () => {});
  const started = Promise.withResolvers<void>();
  const finish = Promise.withResolvers<void>();
  const events: string[] = [];
  const lifecycle = createRemoteGlobalLifecycle(async () => ({
    bootstrap: async () => {
      const index = events.filter((event) => event.startsWith('start')).length + 1;
      events.push(`start:${index}`);
      started.resolve();
      await finish.promise;
      return () => {
        events.push(`stop:${index}`);
        if (index === 1) {
          throw new Error('late cleanup failed');
        }
      };
    },
  }));
  const first = lifecycle.prepare();
  await started.promise;
  const stopped = lifecycle.release();
  const next = lifecycle.prepare();
  finish.resolve();
  await Promise.all([first, stopped, next]);
  assert.deepEqual(events, ['start:1', 'stop:1', 'start:2']);
  assert.equal(report.mock.callCount(), 1);
  assert.equal(lifecycle.getSnapshot().status, 'ready');
  await lifecycle.release();
});

test('continues HMR installation after the previous cleanup throws', async (context) => {
  const report = context.mock.method(console, 'error', () => {});
  const events: string[] = [];
  const lifecycle = createRemoteGlobalLifecycle(async () => ({
    bootstrap: () => {
      events.push('old start');
      return () => {
        events.push('old stop');
        throw new Error('cleanup failed');
      };
    },
  }));
  await lifecycle.prepare();
  await lifecycle.update({
    bootstrap: () => {
      events.push('new start');
    },
  });
  assert.deepEqual(events, ['old start', 'old stop', 'new start']);
  assert.equal(report.mock.callCount(), 1);
  assert.equal(lifecycle.getSnapshot().status, 'ready');
  await lifecycle.release();
});
