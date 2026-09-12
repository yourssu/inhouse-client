import type { ReactElement, ReactNode } from 'react';

import { PageContent } from '../PageContent';
import { Sidebar, type SidebarMenuItem } from '../Sidebar';
import { TabSection } from '../TabSection';
import { PageLayoutProvider } from './provider';

export interface PageLayoutProps {
  children: ReactNode;
  menu?: SidebarMenuItem[];
  profile?: ReactNode;
}

type PageLayoutComponent = ((props: PageLayoutProps) => ReactElement) &
  Record<'Content', typeof PageContent> &
  Record<'TabSection', typeof TabSection>;

/*
  shell 의 인증 레이아웃 크롬과 반응형 배치를 소유해요.
  TabSection 접기 상태는 Sidebar·TabSection 이 같은 localStorage 키로 동기화해요.
*/
export const PageLayout = (({ menu, profile, children }: PageLayoutProps) => {
  return (
    <PageLayoutProvider>
      <div className="flex size-full flex-col overflow-auto md:flex-row">
        <Sidebar menu={menu} profile={profile} />
        {children}
      </div>
    </PageLayoutProvider>
  );
}) as PageLayoutComponent;

PageLayout.TabSection = TabSection;
PageLayout.Content = PageContent;
