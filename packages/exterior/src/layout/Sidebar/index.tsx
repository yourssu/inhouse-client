import type { ReactNode } from 'react';

import { type LinkProps } from '@tanstack/react-router';
import {
  IconButton,
  Sidebar as SidebarPrimitive,
  type ThemeType,
  useTheme,
  useToast,
} from '@yourssu-inhouse/interior';
import { motion } from 'motion/react';
import { IoMdMoon } from 'react-icons/io';
import { MdClose, MdKeyboardDoubleArrowLeft, MdMenu, MdSunny } from 'react-icons/md';
import { useStorageState } from 'react-simplikit';

import { TAB_SECTION_COLLAPSED_STORAGE_KEY } from '../constants';
import { usePageLayoutContext } from '../PageLayout/context';
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

export const Sidebar = ({ menu, profile }: SidebarProps) => {
  const pageLayout = usePageLayoutContext();

  if (!pageLayout?.isMobileLayout) {
    return <SidebarRail menu={menu} profile={profile} />;
  }

  return (
    <header className="border-greyOpacity100 bg-background z-sticky sticky top-0 flex h-14 shrink-0 items-center border-b px-3">
      <SidebarPrimitive
        contentProps={{ style: { width: 'min(328px, 100vw)' } }}
        label="주 메뉴"
        onOpenChange={pageLayout.onMobileSidebarOpenChange}
        open={pageLayout.isMobileSidebarOpen}
        trigger={
          <IconButton aria-label="메뉴 열기" size="md">
            <MdMenu className="text-2xl" />
          </IconButton>
        }
      >
        <div className="flex size-full overflow-hidden">
          <SidebarRail menu={menu} profile={profile} />
          <div
            className="min-w-0 flex-1"
            ref={(container) => pageLayout.setMobileSidebarContainer(container)}
          />
        </div>
      </SidebarPrimitive>
    </header>
  );
};

const SidebarRail = ({ menu = [], profile }: SidebarProps) => {
  const { theme, toggle } = useTheme();
  const toast = useToast();
  const pageLayout = usePageLayoutContext();
  const isMobileLayout = pageLayout?.isMobileLayout ?? false;
  const [isCollapsed, setIsCollapsed] = useStorageState<boolean>(
    TAB_SECTION_COLLAPSED_STORAGE_KEY,
    {
      defaultValue: false,
    },
  );
  const collapseTooltipContent = isCollapsed ? '펼치기' : '접기';

  const handleCloseSidebar = () => {
    if (isMobileLayout) {
      pageLayout?.closeMobileSidebar();
      return;
    }

    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="bg-sidebarBackground sticky top-0 h-full">
      <div className="flex h-full w-18 flex-col items-center justify-between px-0.5 pt-5.5 pb-5">
        <div className="flex w-full flex-col items-center gap-4">
          <IconButton
            aria-label={isMobileLayout ? '메뉴 닫기' : undefined}
            className="text-neutralDisabled text-2xl"
            onClick={handleCloseSidebar}
            size="md"
            tooltipContent={isMobileLayout ? undefined : collapseTooltipContent}
            tooltipProps={{ side: 'right' }}
          >
            {isMobileLayout ? (
              <MdClose />
            ) : (
              <motion.div
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                className="flex items-center justify-center"
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <MdKeyboardDoubleArrowLeft />
              </motion.div>
            )}
          </IconButton>
          {menu.map((item) => {
            const blocked = item.to === '/members';
            const button = (
              <SidebarLinkButton
                disabled={blocked}
                key={`${item.label}-${String(item.to)}`}
                label={item.label}
                to={item.to}
              >
                {item.icon}
              </SidebarLinkButton>
            );

            if (blocked) {
              return (
                <div
                  key={`${item.label}-${String(item.to)}`}
                  onClick={() => {
                    toast.default('아직 준비중인 서비스에요');
                  }}
                >
                  {button}
                </div>
              );
            }
            return button;
          })}
        </div>
        <div className="flex flex-col items-center gap-4">
          <IconButton
            aria-label={themeButtonContent[theme].tooltip}
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
