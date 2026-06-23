import { Link } from '@tanstack/react-router';

import type { RoutePath } from '@/types/route';

import { TabButton } from '@/components/_ui/TabButton';

interface TabButtonProps {
  icon?: React.ReactNode;
  to: RoutePath;
}

export const TabLinkButton = ({ icon, children, to }: React.PropsWithChildren<TabButtonProps>) => {
  return (
    <Link className="rounded-lg" to={to}>
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
