import type { PropsWithChildren, ReactNode } from 'react';

import { Link, type LinkProps } from '@tanstack/react-router';
import { TabButton } from '@yourssu-inhouse/interior';

import { usePageLayoutContext } from '../PageLayout/context';

export interface TabLinkButtonProps {
  icon?: ReactNode;
  to: LinkProps['to'];
}

export const TabLinkButton = ({ icon, children, to }: PropsWithChildren<TabLinkButtonProps>) => {
  const pageLayout = usePageLayoutContext();

  return (
    <Link
      className="rounded-lg"
      onClick={pageLayout?.isMobileLayout ? pageLayout.closeMobileSidebar : undefined}
      to={to}
    >
      {({ isActive }) => (
        <TabButton
          active={isActive}
          className="h-9"
          left={<span className="text-xl">{icon}</span>}
          size="md"
          tabIndex={-1}
        >
          <span className="flex-1 truncate text-left">{children}</span>
        </TabButton>
      )}
    </Link>
  );
};
