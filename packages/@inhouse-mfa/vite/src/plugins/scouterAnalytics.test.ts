import {
  type AnyRouter,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const { mixpanel, replay } = vi.hoisted(() => {
  const replay = { active: false, percent: 0 };

  return {
    replay,
    mixpanel: {
      init: vi.fn(),
      set_config: vi.fn((config: Record<'record_sessions_percent', number>) => {
        replay.percent = config.record_sessions_percent;
      }),
      start_session_recording: vi.fn(async () => {
        replay.active = true;
      }),
      stop_session_recording: vi.fn(() => {
        replay.active = false;
      }),
      track_pageview: vi.fn(),
      // The SDK stops replay and samples again using its current config on reset().
      reset: vi.fn(() => {
        replay.active = replay.percent === 100;
      }),
    },
  };
});

vi.mock('../../../../../apps/scouter/node_modules/mixpanel-browser', () => ({ default: mixpanel }));

interface ScouterAnalytics {
  bootstrapScouterAnalytics: () => Promise<(() => void) | undefined>;
  resetScouterAnalytics: () => void;
  subscribeScouterAnalytics: (router: AnyRouter) => (() => void) | undefined;
}

// The app has its own alias and ImportMeta types, so load it in Vite's runtime context.
const loadAnalytics: () => Promise<ScouterAnalytics> = () =>
  import(new URL('../../../../../apps/scouter/src/analytics/client.ts', import.meta.url).pathname);

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  replay.active = false;
  replay.percent = 0;
  vi.stubEnv('VITE_SCOUTER_MIXPANEL_TOKEN', 'fixture-token');
});

afterEach(() => vi.unstubAllEnvs());

test('records only between Scouter bootstrap and cleanup, including re-entry', async () => {
  const { bootstrapScouterAnalytics, resetScouterAnalytics } = await loadAnalytics();

  expect(mixpanel.init).toHaveBeenCalledWith(
    'fixture-token',
    expect.objectContaining({ record_sessions_percent: 0 }),
  );
  expect(mixpanel.start_session_recording).not.toHaveBeenCalled();

  for (let index = 0; index < 2; index += 1) {
    const cleanup = await bootstrapScouterAnalytics();
    expect(replay.active).toBe(true);
    resetScouterAnalytics();
    expect(replay.active).toBe(true);
    cleanup?.();
    expect(replay.active).toBe(false);
    resetScouterAnalytics();
    expect(replay.active).toBe(false);
  }

  expect(mixpanel.start_session_recording).toHaveBeenCalledTimes(2);
  expect(mixpanel.stop_session_recording).toHaveBeenCalledTimes(2);
});

test('disables automatic replay when starting the recorder fails', async () => {
  const error = new Error('recorder unavailable');
  mixpanel.start_session_recording.mockRejectedValueOnce(error);
  const { bootstrapScouterAnalytics } = await loadAnalytics();

  await expect(bootstrapScouterAnalytics()).rejects.toThrow(error);
  expect(mixpanel.set_config).toHaveBeenLastCalledWith({ record_sessions_percent: 0 });
  expect(mixpanel.stop_session_recording).toHaveBeenCalledTimes(1);
});

test('cleans up router subscriptions and skips the cancelled StrictMode pageview', async () => {
  const { subscribeScouterAnalytics } = await loadAnalytics();
  const root = createRootRoute();
  const recruit = createRoute({ getParentRoute: () => root, path: '/recruit' });
  const applicants = createRoute({ getParentRoute: () => recruit, path: '/applicants' });
  const schedules = createRoute({ getParentRoute: () => recruit, path: '/schedules' });
  const router = createRouter({
    routeTree: root.addChildren([recruit.addChildren([applicants, schedules])]),
    history: createMemoryHistory({ initialEntries: ['/recruit/applicants'] }),
  });
  await router.load();

  subscribeScouterAnalytics(router)?.();
  const cleanup = subscribeScouterAnalytics(router);
  await Promise.resolve();
  expect(mixpanel.track_pageview).toHaveBeenCalledTimes(1);

  cleanup?.();
  await router.navigate({ to: '/recruit/schedules' });
  expect(mixpanel.track_pageview).toHaveBeenCalledTimes(1);

  const nextCleanup = subscribeScouterAnalytics(router);
  await Promise.resolve();
  expect(mixpanel.track_pageview).toHaveBeenCalledTimes(2);
  nextCleanup?.();
});

test('does not initialize or start recording without a Mixpanel token', async () => {
  vi.stubEnv('VITE_SCOUTER_MIXPANEL_TOKEN', '');
  const { bootstrapScouterAnalytics } = await loadAnalytics();

  expect(await bootstrapScouterAnalytics()).toBeUndefined();
  expect(mixpanel.init).not.toHaveBeenCalled();
  expect(mixpanel.start_session_recording).not.toHaveBeenCalled();
});
