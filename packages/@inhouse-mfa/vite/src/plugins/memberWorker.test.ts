import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { expect, test, vi } from 'vitest';

test.each(['Not found', 'Offline'])(
  'keeps the cached MSW worker usable without an unhandled update rejection: %s',
  async (message) => {
    const require = createRequire(
      new URL('../../../../../apps/member/package.json', import.meta.url),
    );
    const source = await readFile(require.resolve('msw/browser'), 'utf8');
    // Exercise the installed SDK implementation, including our pnpm patch.
    const start = source.indexOf('var getWorkerInstance =');
    const end = source.indexOf('\n// ', start);
    expect(start).toBeGreaterThan(0);
    expect(end).toBeGreaterThan(start);
    const worker = { scriptURL: 'http://shell.test/mockServiceWorker.js' };
    const registration = {
      active: worker,
      update: vi.fn().mockRejectedValue(new TypeError(message)),
      unregister: vi.fn(),
    };
    const register = vi.fn();
    const getWorkerInstance = runInNewContext(`${source.slice(start, end)}\ngetWorkerInstance;`, {
      navigator: {
        serviceWorker: {
          controller: worker,
          getRegistrations: async () => [registration],
          register,
        },
      },
      location: { reload: vi.fn() },
      getAbsoluteWorkerUrl: () => worker.scriptURL,
      getWorkerByRegistration: () => worker,
    }) as (url: string) => Promise<unknown[]>;

    await expect(getWorkerInstance(worker.scriptURL)).resolves.toEqual([worker, registration]);
    expect(registration.update).toHaveBeenCalledOnce();
    expect(registration.unregister).not.toHaveBeenCalled();
    expect(register).not.toHaveBeenCalled();
  },
);
