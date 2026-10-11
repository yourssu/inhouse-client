import { createContext, useContext } from 'react';

interface PageLayoutContextValue {
  closeMobileSidebar: () => void;
  isMobileLayout: boolean;
  isMobileSidebarOpen: boolean;
  mobileSidebarContainer: HTMLDivElement | null;
  onMobileSidebarOpenChange: (open: boolean) => void;
  setMobileSidebarContainer: (container: HTMLDivElement | null) => void;
}

export const PageLayoutContext = createContext<null | PageLayoutContextValue>(null);

export const usePageLayoutContext = () => useContext(PageLayoutContext);
