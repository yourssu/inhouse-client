import { cn } from '@yourssu-inhouse/interior-tailwind/utils';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useDeferredValue, useId, useState } from 'react';

interface InterviewTabProps<TTab extends string> {
  children: (p: { tab: TTab }) => React.ReactNode;
  className?: string;
  tabs: Readonly<TTab[]>;
}

export const InterviewTab = <TTab extends string>({
  tabs,
  children,
  className,
}: InterviewTabProps<TTab>) => {
  const id = useId();
  const [activeTab, setActiveTab] = useState<null | TTab>(tabs[0] ?? null);
  const deferredActiveTab = useDeferredValue(activeTab);

  const handleTabClick = (nextTab: TTab) => {
    setActiveTab((prev) => (prev === nextTab ? null : nextTab));
  };

  return (
    <div className={cn('flex w-full gap-3', className)}>
      <LayoutGroup id={id}>
        <div aria-orientation="vertical" className="flex flex-col gap-1.5" role="tablist">
          {tabs.map((item) => {
            const isHighlighted = item === activeTab;
            const isTabbable = item === (activeTab ?? tabs[0]);

            return (
              <button
                aria-controls={deferredActiveTab !== null ? `${id}-tabpanel` : undefined}
                aria-selected={isHighlighted}
                className={cn(
                  'rounded-6 relative flex cursor-pointer border-none px-3 py-2 transition-colors outline-none',
                  isHighlighted ? 'bg-greyOpacity100' : 'bg-lightBackground',
                )}
                id={`${id}-tab-${item}`}
                key={item}
                onClick={() => handleTabClick(item)}
                role="tab"
                tabIndex={isTabbable ? 0 : -1}
                type="button"
              >
                <span
                  className={cn(
                    'text-sm [text-orientation:upright] [writing-mode:vertical-rl]',
                    isHighlighted
                      ? 'text-violet600 font-semibold'
                      : 'text-neutralMuted font-medium',
                  )}
                >
                  {item}
                </span>
                {isHighlighted && (
                  <motion.div
                    className="bg-violet600 absolute top-0 right-0 h-full w-0.5"
                    layoutId="interview-tab-indicator"
                    transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </LayoutGroup>
      <AnimatePresence initial={false}>
        {deferredActiveTab !== null && (
          <motion.div
            animate={{ width: 'auto', opacity: 1 }}
            aria-labelledby={`${id}-tab-${deferredActiveTab}`}
            className="overflow-hidden"
            exit={{ width: 0, opacity: 0 }}
            id={`${id}-tabpanel`}
            initial={{ width: 0, opacity: 0 }}
            role="tabpanel"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {children({ tab: deferredActiveTab })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
