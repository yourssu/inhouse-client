import type { ReactNode } from 'react';

import { type LinkProps } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { useStorageState } from 'react-simplikit';

import { TAB_SECTION_COLLAPSED_STORAGE_KEY } from '../constants';
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
  const [isCollapsed] = useStorageState<boolean>(TAB_SECTION_COLLAPSED_STORAGE_KEY, {
    defaultValue: false,
  });

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
      <div className="flex h-full w-64 flex-col">
        <div className="mb-7 px-4">{logo}</div>

        <div className="mb-7 px-4">
          <div className="bg-greyOpacity50 text-13 text-neutralSubtle flex items-center rounded-lg font-medium">
            <button className="h-9 w-full cursor-pointer rounded-lg text-center hover:underline">
              가이드
            </button>
            <span className="text-grey300 font-normal">|</span>
            <button className="h-9 w-full cursor-pointer rounded-lg text-center hover:underline">
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
    </motion.div>
  );
};
