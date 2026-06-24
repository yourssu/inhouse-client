import { useTheme } from '@yourssu-inhouse/interior';
import { motion } from 'motion/react';

import type { RoutePath } from '@/types/route';

import { useTabSectionContext } from '@/components/PageLayout/context';
import { TabLinkButton } from '@/components/PageLayout/TabSection/TabButton';

type TabItem = {
  content: string;
  icon?: React.ReactNode;
  to: RoutePath;
};

interface TabSectionProps {
  items: TabItem[];
}

export const TabSection = ({ items }: TabSectionProps) => {
  const { theme } = useTheme();
  const { isCollapsed } = useTabSectionContext();

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
        <div className="mb-7 px-4">
          <img alt="유어슈 인하우스 로고" className="h-5" src={`/logo-${theme}.png`} />
        </div>

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
