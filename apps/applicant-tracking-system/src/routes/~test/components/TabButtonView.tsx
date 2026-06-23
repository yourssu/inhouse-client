import { useState } from 'react';
import { MdCheck } from 'react-icons/md';

import { TabButton } from '@/components/_ui/TabButton';

const tabs = ['전체', '사람', '텍스트', '날짜', '링크'] as const;
const sizes = ['md', 'lg'] as const;

export const TabButtonView = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('전체');

  return (
    <div className="flex max-w-sm flex-col gap-12">
      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">Base</h3>
        {sizes.map((size) => (
          <div className="flex flex-col gap-2" key={size}>
            <div className="text-13 text-greyOpacity500 font-medium">Size: {size}</div>
            <div className="border-greyOpacity100 bg-grey100 flex w-64 flex-col gap-1 rounded-lg border p-2">
              {tabs.map((tab) => (
                <TabButton
                  active={activeTab === tab}
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  size={size}
                >
                  {tab}
                </TabButton>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">With Icons</h3>
        <div className="border-greyOpacity100 bg-grey100 flex w-64 flex-col gap-1 rounded-lg border p-2">
          <TabButton active left={<MdCheck />} size="lg">
            Active Option
          </TabButton>
          <TabButton right={<MdCheck />} size="lg">
            Right Icon
          </TabButton>
          <TabButton size="lg">Regular Option</TabButton>
        </div>
      </div>
    </div>
  );
};
