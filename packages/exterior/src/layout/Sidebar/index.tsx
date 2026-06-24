import { type LinkProps } from '@tanstack/react-router';
import { IconButton, type ThemeType, useTheme } from '@yourssu-inhouse/interior';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { IoMdMoon } from 'react-icons/io';
import { MdKeyboardDoubleArrowLeft, MdSunny } from 'react-icons/md';

import { useCollapsible } from '../../router/staticData';
import { useTabSectionContext } from '../PageLayout/context';
import { SidebarLinkButton } from './SidebarLinkButton';

export interface SidebarMenuItem {
  icon: ReactNode;
  label: string;
  to: LinkProps['to'];
}

export interface SidebarProps {
  menu?: SidebarMenuItem[];
  profile?: ReactNode;
}

export const Sidebar = ({ menu = [], profile }: SidebarProps) => {
  const { theme, toggle } = useTheme();
  const { isCollapsed, setIsCollapsed } = useTabSectionContext();
  const collapsible = useCollapsible();

  return (
    <div className="bg-sidebarBackground sticky top-0 h-full">
      <div className="flex h-full w-18 flex-col items-center justify-between px-0.5 pt-5.5 pb-5">
        <div className="flex w-full flex-col items-center gap-4">
          {collapsible && (
            <IconButton
              className="text-neutralDisabled text-2xl"
              onClick={() => {
                setIsCollapsed(!isCollapsed);
              }}
              size="md"
              tooltipContent={isCollapsed ? '펼치기' : '접기'}
              tooltipProps={{ side: 'right' }}
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                className="flex items-center justify-center"
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <MdKeyboardDoubleArrowLeft />
              </motion.div>
            </IconButton>
          )}
          {menu.map((item) => (
            <SidebarLinkButton key={`${item.label}-${String(item.to)}`} label={item.label} to={item.to}>
              {item.icon}
            </SidebarLinkButton>
          ))}
        </div>
        <div className="flex flex-col items-center gap-4">
          <IconButton
            onClick={toggle}
            size="md"
            tooltipContent={themeButtonContent[theme].tooltip}
            tooltipProps={{ side: 'right' }}
          >
            <div className="text-neutralDisabled text-2xl">{themeButtonContent[theme].icon}</div>
          </IconButton>
          <div className="size-8">{profile}</div>
        </div>
      </div>
    </div>
  );
};

const themeButtonContent = {
  light: {
    tooltip: '라이트모드',
    icon: <MdSunny />,
  },
  dark: {
    tooltip: '다크모드',
    icon: <IoMdMoon />,
  },
} as const satisfies Record<ThemeType, { icon: ReactNode; tooltip: string }>;
