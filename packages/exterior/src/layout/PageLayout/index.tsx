import { useStorageState } from 'react-simplikit';
import type { ReactElement, ReactNode } from 'react';

import { PageContent } from '../PageContent';
import { Sidebar, type SidebarMenuItem } from '../Sidebar';
import { TabSection } from '../TabSection';
import { TabSectionContext } from './context';

export interface PageLayoutProps {
  menu?: SidebarMenuItem[];
  profile?: ReactNode;
  children: ReactNode;
}

type PageLayoutComponent = ((props: PageLayoutProps) => ReactElement) & {
  TabSection: typeof TabSection;
  Content: typeof PageContent;
};

export const PageLayout = (({ menu, profile, children }: PageLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useStorageState<boolean>('tab-section-collapsed', {
    defaultValue: false,
  });

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
