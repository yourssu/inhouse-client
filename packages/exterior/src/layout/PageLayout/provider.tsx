import type { PropsWithChildren } from 'react';

import { useEffect, useState, useSyncExternalStore } from 'react';

import { PageLayoutContext } from './context';

const mobileLayoutQuery = '(max-width: 767px)';

const subscribeMobileLayout = (callback: () => void) => {
  const mediaQuery = window.matchMedia(mobileLayoutQuery);
  mediaQuery.addEventListener('change', callback);

  return () => mediaQuery.removeEventListener('change', callback);
};

const getIsMobileLayout = () => window.matchMedia(mobileLayoutQuery).matches;

export const PageLayoutProvider = ({ children }: PropsWithChildren) => {
  const isMobileLayout = useSyncExternalStore(
    subscribeMobileLayout,
    getIsMobileLayout,
    () => false,
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mobileSidebarContainer, setMobileSidebarContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(mobileLayoutQuery);
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (!event.matches) {
        setIsMobileSidebarOpen(false);
      }
    };

    mediaQuery.addEventListener('change', closeOnDesktop);
    return () => mediaQuery.removeEventListener('change', closeOnDesktop);
  }, []);

  return (
    <PageLayoutContext.Provider
      value={{
        closeMobileSidebar: () => setIsMobileSidebarOpen(false),
        isMobileLayout,
        isMobileSidebarOpen,
        mobileSidebarContainer,
        onMobileSidebarOpenChange: setIsMobileSidebarOpen,
        setMobileSidebarContainer,
      }}
    >
      {children}
    </PageLayoutContext.Provider>
  );
};
