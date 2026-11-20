import { Tab } from '@yourssu-inhouse/interior';
import clsx from 'clsx';

export const TabView = () => (
  <div className="flex w-full flex-col gap-4">
    <div className="border-greyOpacity100 rounded-xl border bg-white/5 p-4">
      <Tab.Root defaultValue="Tab 1">
        <Tab.List aria-label="데모">
          <Tab.Item value="Tab 1">Tab 1</Tab.Item>
          <Tab.Item value="Tab 2">Tab 2</Tab.Item>
          <Tab.Item value="Tab 3">Tab 3</Tab.Item>
        </Tab.List>
        <Tab.Panel value="Tab 1">
          <div className={panelClassName}>Tab 1 Content</div>
        </Tab.Panel>
        <Tab.Panel value="Tab 2">
          <div className={panelClassName}>Tab 2 Content</div>
        </Tab.Panel>
        <Tab.Panel value="Tab 3">
          <div className={panelClassName}>Tab 3 Content</div>
        </Tab.Panel>
      </Tab.Root>
    </div>
  </div>
);

const panelClassName = clsx(
  'border-greyOpacity100 text-15 text-greyOpacity500 mt-4 flex min-h-[100px] items-center justify-center rounded-lg border-2 border-dashed font-medium',
);
