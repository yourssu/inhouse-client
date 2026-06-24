import { useStorageState } from 'react-simplikit';

import { TabSectionContext } from '@/components/PageLayout/context';
import { PageContent } from '@/components/PageLayout/PageContent';
import { Sidebar } from '@/components/PageLayout/Sidebar';
import { TabSection } from '@/components/PageLayout/TabSection';

export const PageLayout = ({ children }: React.PropsWithChildren<unknown>) => {
  const [isCollapsed, setIsCollapsed] = useStorageState<boolean>('tab-section-collapsed', {
    defaultValue: false,
  });

  return (
    <TabSectionContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="flex size-full overflow-auto">
        <Sidebar />
        {children}
      </div>
    </TabSectionContext.Provider>
  );
};

PageLayout.TabSection = TabSection;
PageLayout.Content = PageContent;
