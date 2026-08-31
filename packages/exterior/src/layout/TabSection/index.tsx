import type { ReactNode } from 'react';

import { type LinkProps } from '@tanstack/react-router';
import { useToast } from '@yourssu-inhouse/interior';
import { motion } from 'motion/react';
import { createPortal } from 'react-dom';
import { useStorageState } from 'react-simplikit';

import { TAB_SECTION_COLLAPSED_STORAGE_KEY } from '../constants';
import { usePageLayoutContext } from '../PageLayout/context';
import { TabLinkButton } from './TabButton';

export interface TabItem {
  content: string;
  icon?: ReactNode;
  to: LinkProps['to'];
}

export interface TabSectionProps {
  items: TabItem[];
  logo: React.ReactNode;
}

export const TabSection = ({ items, logo }: TabSectionProps) => {
  const toast = useToast();
  const pageLayout = usePageLayoutContext();
  const [isCollapsed] = useStorageState<boolean>(TAB_SECTION_COLLAPSED_STORAGE_KEY, {
    defaultValue: false,
  });

  const showNotReadyToast = () => toast.default('아직 준비중인 기능이에요');

  const content = (
    <div className="flex h-full w-full flex-col">
      <div className="mb-7 px-4">{logo}</div>

      <div className="mb-7 px-4">
        <div className="bg-greyOpacity50 text-13 text-neutralSubtle flex items-center rounded-lg font-medium">
          <button
            className="h-9 w-full cursor-pointer rounded-lg text-center hover:underline"
            onClick={showNotReadyToast}
            type="button"
          >
            가이드
          </button>
          <span className="text-grey300 font-normal">|</span>
          <button
            className="h-9 w-full cursor-pointer rounded-lg text-center hover:underline"
            onClick={showNotReadyToast}
            type="button"
          >
            의견 보내기
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 px-3">
        {items.map((item) => (
          <TabLinkButton icon={item.icon} key={item.content} to={item.to}>
            {item.content}
          </TabLinkButton>
        ))}
      </div>
    </div>
  );

  if (pageLayout?.isMobileLayout) {
    if (!pageLayout.mobileSidebarContainer) {
      return null;
    }

    return createPortal(
      <div className="border-greyOpacity100 h-full min-w-0 flex-1 overflow-hidden border-r border-solid py-7">
        {content}
      </div>,
      pageLayout.mobileSidebarContainer,
    );
  }

  return (
    <motion.div
      animate={{
        width: isCollapsed ? 0 : 256,
        borderRightWidth: isCollapsed ? 0 : 1,
      }}
      className="border-greyOpacity100 sticky top-0 h-full overflow-hidden border-solid py-7"
      initial={false}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      <div className="h-full w-64">{content}</div>
    </motion.div>
  );
};
