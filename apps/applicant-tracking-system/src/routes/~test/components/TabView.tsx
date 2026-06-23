import { useState } from 'react';

import { Tab } from '@/components/_ui/Tab';

export const TabView = () => {
  const [currentTab, setCurrentTab] = useState('Tab 1');

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="border-greyOpacity100 rounded-xl border bg-white/5 p-4">
        <Tab defaultTab="Tab 1" onTabChange={setCurrentTab} tabs={['Tab 1', 'Tab 2', 'Tab 3']}>
          {({ tab }) => (
            <div className="border-greyOpacity100 mt-4 flex min-h-[100px] items-center justify-center rounded-lg border-2 border-dashed">
              <span className="text-15 text-greyOpacity500 font-medium">
                {tab} Content
                <br />
                State: {currentTab}
              </span>
            </div>
          )}
        </Tab>
      </div>
    </div>
  );
};
