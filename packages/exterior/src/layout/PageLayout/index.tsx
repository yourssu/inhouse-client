import type { ReactElement, ReactNode } from 'react';

import { useCallback, useEffect, useState } from 'react';

import { PageContent } from '../PageContent';
import { Sidebar, type SidebarMenuItem } from '../Sidebar';
import { TabSection } from '../TabSection';
import { TabSectionContext } from './context';

export interface PageLayoutProps {
  children: ReactNode;
  menu?: SidebarMenuItem[];
  profile?: ReactNode;
}

type PageLayoutComponent = ((props: PageLayoutProps) => ReactElement) &
  Record<'Content', typeof PageContent> &
  Record<'TabSection', typeof TabSection>;

const TAB_SECTION_COLLAPSED_KEY = 'tab-section-collapsed';

const getInitialCollapsed = () => {
  const storedValue = window.localStorage.getItem(TAB_SECTION_COLLAPSED_KEY);

  if (!storedValue) {
    return false;
  }

  return storedValue === 'true' || storedValue === '1';
};

export const PageLayout = (({ menu, profile, children }: PageLayoutProps) => {
  const [isCollapsed, setCollapsed] = useState(getInitialCollapsed);

  useEffect(() => {
    window.localStorage.setItem(TAB_SECTION_COLLAPSED_KEY, String(isCollapsed));
  }, [isCollapsed]);

  const setIsCollapsed = useCallback((value: boolean) => {
    setCollapsed(value);
  }, []);

  return (
    <TabSectionContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="flex size-full overflow-auto">
        <Sidebar menu={menu} profile={profile} />
        {children}
      </div>
    </TabSectionContext.Provider>
  );
}) as PageLayoutComponent;

PageLayout.TabSection = TabSection;
PageLayout.Content = PageContent;
