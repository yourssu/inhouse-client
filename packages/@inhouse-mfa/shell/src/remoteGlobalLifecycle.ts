import type { RemoteGlobal, RemotePlugin } from '@inhouse-mfa/core';

export type RemoteGlobalState =
  | { error: unknown; revision: number; status: 'error' }
  | { global: RemoteGlobal; revision: number; status: 'ready' }
  | { revision: number; status: 'idle' | 'pending' };

interface Installation {
  cancelled: boolean;
  cleanup?: (() => void) | void;
  promise: Promise<RemoteGlobal | undefined>;
}

export const createRemoteGlobalLifecycle = (
  loadGlobal: NonNullable<RemotePlugin['global']>,
  name = 'remote',
) => {
  let state: RemoteGlobalState = { status: 'idle', revision: 0 };
  let installation: Installation | undefined;
  let pending = Promise.resolve();
  let epoch = 0;
  let latestGlobal: RemoteGlobal | undefined;
  const listeners = new Set<() => void>();

  const publish = (next: RemoteGlobalState) => {
    state = next;
    listeners.forEach((listener) => listener());
  };

  const cleanup = (current: Installation) => {
    const stop = current.cleanup;
    current.cleanup = undefined;
    try {
      stop?.();
    } catch (error) {
      console.error(`[mfa-shell] '${name}' cleanup failed`, error);
    }
  };

  const release = () => {
    epoch += 1;
    if (installation) {
      installation.cancelled = true;
      cleanup(installation);
      installation = undefined;
    }

    if (state.status !== 'idle') {
      publish({ status: 'idle', revision: state.revision });
    }

    return pending;
  };

  const prepare = () => {
    if (installation) {
      return installation.promise;
    }

    epoch += 1;
    const revision = state.revision + 1;
    publish({ status: 'pending', revision });
    const current: Installation = {
      cancelled: false,
      promise: pending
        .then(async () => {
          if (current.cancelled) {
            return;
          }

          const global = latestGlobal ?? (await loadGlobal());
          if (current.cancelled) {
            return;
          }

          current.cleanup = await global.bootstrap?.();
          if (current.cancelled) {
            cleanup(current);
            return;
          }

          latestGlobal = global;
          publish({ status: 'ready', revision, global });
          return global;
        })
        .catch((error: unknown) => {
          if (!current.cancelled) {
            publish({ status: 'error', revision, error });
            throw error;
          }
          return undefined;
        }),
    };
    installation = current;
    // Serialize a re-entry with unfinished initialization and its eventual cleanup.
    pending = current.promise.then(
      () => undefined,
      () => undefined,
    );
    return current.promise;
  };

  const update = async (global: RemoteGlobal) => {
    const previous = latestGlobal;
    latestGlobal = global;
    if (!installation) {
      return;
    }

    if (state.status === 'ready' && previous?.bootstrap === global.bootstrap) {
      publish({ ...state, global });
      return;
    }

    const stopped = release();
    const updateEpoch = epoch;
    await stopped;
    if (epoch === updateEpoch) {
      return prepare();
    }
  };

  return {
    getSnapshot: () => state,
    prepare,
    release,
    update,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

const lifecycles = new WeakMap<RemotePlugin, ReturnType<typeof createRemoteGlobalLifecycle>>();

export const getRemoteGlobalLifecycle = (plugin: RemotePlugin) => {
  if (!plugin.global) {
    return;
  }

  let lifecycle = lifecycles.get(plugin);
  if (!lifecycle) {
    lifecycle = createRemoteGlobalLifecycle(plugin.global, plugin.name);
    lifecycles.set(plugin, lifecycle);
  }

  return lifecycle;
};

const groups = new WeakMap<RemotePlugin, readonly RemotePlugin[]>();

export const registerRemoteGlobalGroup = (plugins: readonly RemotePlugin[]) => {
  plugins.forEach((plugin) => groups.set(plugin, plugins));
};

export const prepareRemoteGlobal = async (plugin: RemotePlugin, signal: AbortSignal) => {
  if (signal.aborted) {
    return;
  }

  await Promise.all(
    (groups.get(plugin) ?? [])
      .filter((other) => other !== plugin)
      .map((other) => getRemoteGlobalLifecycle(other)?.release()),
  );

  if (signal.aborted) {
    return;
  }

  return getRemoteGlobalLifecycle(plugin)?.prepare();
};
