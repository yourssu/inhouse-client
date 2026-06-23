import { PageContent } from '@/components/PageLayout/PageContent';
import { Sidebar } from '@/components/PageLayout/Sidebar';
import { TabSection } from '@/components/PageLayout/TabSection';

export const PageLayout = ({ children }: React.PropsWithChildren<unknown>) => {
  return (
    <div className="flex size-full overflow-auto">
      <Sidebar />
      {children}
    </div>
  );
};

PageLayout.TabSection = TabSection;
PageLayout.Content = PageContent;
