import type { AnyRouter } from '@tanstack/react-router';

import mixpanel from 'mixpanel-browser';

import type { MeType } from '@/apis/members/schema';

type ScouterAnalyticsUser = Pick<
  MeType,
  'email' | 'name' | 'nickname' | 'parts' | 'role' | 'state'
>;

type ScouterEventPropertyValue = boolean | number | readonly string[] | string;

const mixpanelToken = import.meta.env.VITE_SCOUTER_MIXPANEL_TOKEN?.trim();
const scouterBasePath = '/recruit';
/** Scouter 페이지의 라우팅이 완료됐을 때 발생해요. */
const scouterPageViewEventName = 'scouter_page_view';

if (mixpanelToken) {
  mixpanel.init(mixpanelToken, {
    autocapture: false,
    debug: true,
    persistence: 'localStorage',
    record_sessions_percent: 0,
  });
}

export const bootstrapScouterAnalytics = async () => {
  if (!mixpanelToken) {
    return;
  }

  const cleanup = () => {
    mixpanel.set_config({ record_sessions_percent: 0 });
    mixpanel.stop_session_recording();
  };

  // reset() restarts replay according to this setting, including StrictMode cleanup.
  mixpanel.set_config({ record_sessions_percent: 100 });

  try {
    await mixpanel.start_session_recording();

    return cleanup;
  } catch (error) {
    cleanup();
    throw error;
  }
};

export const subscribeScouterAnalytics = (router: AnyRouter) => {
  if (!mixpanelToken) {
    return;
  }

  const trackPageView = () => {
    const pathname = router.state.location.pathname;
    const isScouterPath =
      pathname === scouterBasePath || pathname.startsWith(`${scouterBasePath}/`);

    if (!isScouterPath) {
      return;
    }

    const fullPath = router.state.matches.at(-1)?.fullPath;
    if (!fullPath) {
      return;
    }

    mixpanel.track_pageview({ page: fullPath }, { event_name: scouterPageViewEventName });
  };

  let active = true;
  let resolved = false;
  const unsubscribe = router.subscribe('onResolved', ({ pathChanged }) => {
    if (pathChanged) {
      resolved = true;
      trackPageView();
    }
  });

  // StrictMode's first Effect is cleaned up before this task runs.
  queueMicrotask(() => {
    if (active && !resolved) {
      trackPageView();
    }
  });

  return () => {
    active = false;
    unsubscribe();
  };
};

export const identifyScouterUser = (userId: number) => {
  if (!mixpanelToken) {
    return;
  }

  mixpanel.identify(String(userId));
};

export const setScouterUserProperties = ({
  email,
  name,
  nickname,
  parts,
  role,
  state,
}: ScouterAnalyticsUser) => {
  if (!mixpanelToken) {
    return;
  }

  mixpanel.people.set({
    $email: email,
    $name: nickname,
    name,
    parts: parts.map(({ part }) => part),
    role,
    state,
  });
};

export const trackScouterEvent = (
  eventName: string,
  properties: Record<string, ScouterEventPropertyValue>,
) => {
  if (!mixpanelToken) {
    return;
  }

  mixpanel.track(eventName, properties);
};

export const resetScouterAnalytics = () => {
  if (!mixpanelToken) {
    return;
  }

  mixpanel.reset();
};
