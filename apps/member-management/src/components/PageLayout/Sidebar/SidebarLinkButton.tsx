import { Link, type LinkComponentProps } from '@tanstack/react-router';
import clsx from 'clsx';

import { useTabSectionContext } from '@/components/PageLayout/context';

interface SidebarLinkButtonProps extends LinkComponentProps {
  label: string;
}

export const SidebarLinkButton = ({
  label,
  children,
  onClick,
  ...props
}: React.PropsWithChildren<SidebarLinkButtonProps>) => {
  const { isCollapsed, setIsCollapsed } = useTabSectionContext();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isCollapsed) {
      setIsCollapsed(false);
    }
    onClick?.(e);
  };

  return (
    <Link className="group w-full rounded-lg pt-1" onClick={handleClick} {...props}>
      {({ isActive }) => {
        return (
          <div
            className={clsx(
              'flex flex-col items-center gap-1.5 transition-[color_0.2s_ease]',
              isActive ? 'text-neutral' : 'text-neutralDisabled',
            )}
          >
            <div
              className={clsx(
                'group-hover:bg-grey200 flex h-10.5 w-10.5 items-center justify-center rounded-lg text-2xl transition-[background-color_0.2s_ease]',
                isActive && 'bg-grey200',
              )}
            >
              {children}
            </div>
            <span className="text-xs font-semibold">{label}</span>
          </div>
        );
      }}
    </Link>
  );
};
