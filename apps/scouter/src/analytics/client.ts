import mixpanel from 'mixpanel-browser';

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

export const resetScouterAnalytics = () => {
  if (!mixpanelToken) {
    return;
  }

  mixpanel.reset();
};
