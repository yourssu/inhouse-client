import { ChipTab } from '@/components/_ui/ChipTab';

export const ChipTabView = () => {
  return (
    <>
      <div className="flex gap-4">
        <ChipTab defaultTab="a" onTabChange={() => {}} tabs={['a', 'b', 'c']}>
          {({ tab }) => <div>{tab}</div>}
        </ChipTab>
      </div>
    </>
  );
};
