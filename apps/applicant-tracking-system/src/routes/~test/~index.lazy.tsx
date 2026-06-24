import { createLazyFileRoute, Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { useState } from 'react';

import { InlineButton } from '@/components/_ui/InlineButton';
import { useTheme } from '@yourssu-inhouse/interior';
import { useSearchState } from '@/hooks/useSearchState';
import { BadgeView } from '@/routes/~test/components/BadgeView';
import { TAB_CATEGORIES } from '@/routes/~test/type';

import { ButtonView } from './components/ButtonView';
import { CheckboxView } from './components/CheckboxView';
import { ChipTabView } from './components/ChipTabView';
import { ColorsView } from './components/ColorsView';
import { ComboboxView } from './components/ComboboxView';
import { DatePickerView } from './components/DatePickerView';
import { DialogView } from './components/DialogView';
import { IconButtonView } from './components/IconButtonView';
import { LottieView } from './components/LottieView';
import { SearchFieldView } from './components/SearchFieldView';
import { SegmentedControlView } from './components/SegmentedControlView';
import { SelectView } from './components/SelectView';
import { SwitchView } from './components/SwitchView';
import { TabButtonView } from './components/TabButtonView';
import { TabView } from './components/TabView';
import { TextFieldView } from './components/TextFieldView';
import { ToastView } from './components/ToastView';

const RouteComponent = () => {
  const [search] = useSearchState({ from: '/test/' });
  const { toggle } = useTheme();
  const { tab } = search;
  const [layered, setLayered] = useState(false);

  return (
    <div className="bg-greyOpacity50 flex h-screen w-full">
      <div className="border-greyOpacity100 flex w-[240px] shrink-0 flex-col gap-1 overflow-y-auto border-r p-4">
        <div className="mb-4 flex items-center justify-between px-2">
          <h1 className="text-20 text-greyOpacity900 font-bold">Components</h1>
          <InlineButton onClick={toggle}>light/dark</InlineButton>
        </div>
        {TAB_CATEGORIES.map((category) => (
          <div className="mb-6" key={category.title}>
            <h3 className="text-greyOpacity500 mb-2 px-4 text-sm font-semibold">
              {category.title}
            </h3>
            {category.items.map((tab) => (
              <Link key={tab} search={{ tab }} to="/test">
                {({ isActive }) => (
                  <div
                    className={`text-15 hover:bg-greyOpacity100 rounded-lg px-4 py-3 text-left font-medium transition-colors ${
                      isActive
                        ? 'bg-greyOpacity100 text-greyOpacity900 font-semibold'
                        : 'text-greyOpacity700'
                    }`}
                  >
                    {tab}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className={clsx('flex-1 overflow-y-auto p-10', layered && 'bg-lightBackground')}>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-24 text-greyOpacity900 font-bold">{tab}</h2>
          <InlineButton onClick={() => setLayered((prev) => !prev)}>change layer</InlineButton>
        </div>
        {tab === 'Lottie' && <LottieView />}
        {tab === 'Colors' && <ColorsView />}
        {tab === 'Button' && <ButtonView />}
        {tab === 'Badge' && <BadgeView />}
        {tab === 'Toast' && <ToastView />}
        {tab === 'TextField' && <TextFieldView />}
        {tab === 'Dialog' && <DialogView />}
        {tab === 'IconButton' && <IconButtonView />}
        {tab === 'Select' && <SelectView />}
        {tab === 'DatePicker' && <DatePickerView />}
        {tab === 'Switch' && <SwitchView />}
        {tab === 'ChipTab' && <ChipTabView />}
        {tab === 'SearchField' && <SearchFieldView />}
        {tab === 'Checkbox' && <CheckboxView />}
        {tab === 'SegmentedControl' && <SegmentedControlView />}
        {tab === 'Tab' && <TabView />}
        {tab === 'TabButton' && <TabButtonView />}
        {tab === 'Combobox' && <ComboboxView />}
      </div>
    </div>
  );
};

export const Route = createLazyFileRoute('/test/')({
  component: RouteComponent,
});
