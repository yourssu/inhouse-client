import type { ReactElement, ReactNode } from 'react';

import { PageContent } from '../PageContent';
import { Sidebar, type SidebarMenuItem } from '../Sidebar';
import { TabSection } from '../TabSection';

export interface PageLayoutProps {
  children: ReactNode;
  menu?: SidebarMenuItem[];
  profile?: ReactNode;
}

type PageLayoutComponent = ((props: PageLayoutProps) => ReactElement) &
  Record<'Content', typeof PageContent> &
  Record<'TabSection', typeof TabSection>;

/*
  shell 의 인증 레이아웃 크롬이에요. Sidebar(좌측 아이콘 바) + 자식(Outlet)을 나열해요.
  TabSection 접기 상태는 더 이상 context 로 내려주지 않고 Sidebar·TabSection 이 각자
  useStorageState 로 localStorage 에서 직접 읽어와요(같은 키로 동기화). 그래서 Provider 없이도
  shell·standalone 모두 동작해요.
*/
export const PageLayout = (({ menu, profile, children }: PageLayoutProps) => {
  return (
    <div className="flex size-full overflow-auto">
      <Sidebar menu={menu} profile={profile} />
      {children}
    </div>
  );
}) as PageLayoutComponent;

PageLayout.TabSection = TabSection;
PageLayout.Content = PageContent;
