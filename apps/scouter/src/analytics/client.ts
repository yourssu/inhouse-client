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

export const initScouterAnalytics = (router: AnyRouter) => {
  if (!mixpanelToken) {
    return;
  }

  mixpanel.init(mixpanelToken, {
    autocapture: false,
    debug: true,
    persistence: 'localStorage',
    record_sessions_percent: 100,
  });

  router.subscribe('onResolved', ({ pathChanged, toLocation }) => {
    const isScouterPath =
      toLocation.pathname === scouterBasePath ||
      toLocation.pathname.startsWith(`${scouterBasePath}/`);

    if (!pathChanged || !isScouterPath) {
      return;
    }

    const fullPath = router.state.matches.at(-1)?.fullPath;
    if (!fullPath) {
      return;
    }

    mixpanel.track_pageview({ page: fullPath }, { event_name: scouterPageViewEventName });
  });
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
