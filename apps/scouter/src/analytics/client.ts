import mixpanel from 'mixpanel-browser';

import type { MeType } from '@/apis/members/schema';

type ScouterAnalyticsUser = Pick<
  MeType,
  'email' | 'name' | 'nickname' | 'parts' | 'role' | 'state'
>;

const mixpanelToken = import.meta.env.VITE_SCOUTER_MIXPANEL_TOKEN?.trim();

export const initScouterAnalytics = () => {
  if (!mixpanelToken) {
    return;
  }

  mixpanel.init(mixpanelToken, {
    autocapture: false,
    debug: true,
    persistence: 'localStorage',
    record_heatmap_data: true,
    record_sessions_percent: 100,
    track_pageview: 'url-with-path',
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
  properties: Record<string, boolean | number | string>,
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
