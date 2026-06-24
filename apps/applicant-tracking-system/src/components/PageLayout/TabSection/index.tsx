import { useTheme } from '@yourssu-inhouse/interior';

import type { RoutePath } from '@/types/route';

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

  return (
    <div className="border-greyOpacity100 sticky top-0 h-full w-64 border-r py-7">
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
  );
};
