import { createExteriorApp } from '@exterior/core';
import { createRootRoute, createRoute } from '@tanstack/react-router';
import { expect, test, vi } from 'vitest';

import { bootstrapShell } from '../../../shell/src/bootstrap';

vi.mock('@exterior/core', () => ({ createExteriorApp: vi.fn() }));

test('waits for mount and propagates mount rejection to the shell caller', async () => {
  const routeTree = createRootRoute();
  routeTree.addChildren([createRoute({ getParentRoute: () => routeTree, id: '/_auth' })]);
  let rejectMount: ((error: Error) => void) | undefined;
  const mount = vi.fn(
    () =>
      new Promise<never>((_, reject) => {
        rejectMount = reject;
      }),
  );
  const app = { mount } as unknown as ReturnType<typeof createExteriorApp>;
  vi.mocked(createExteriorApp).mockReturnValue(app);
  let finished = false;
  const boot = bootstrapShell({ routeTree, specs: [] }).finally(() => {
    finished = true;
  });
  // Attach the rejection assertion before rejecting the pending mount.
  const failed = expect(boot).rejects.toThrow('mount failed');
  await vi.waitFor(() => expect(mount).toHaveBeenCalledOnce());
  expect(finished).toBe(false);
  rejectMount?.(new Error('mount failed'));
  await failed;
});
