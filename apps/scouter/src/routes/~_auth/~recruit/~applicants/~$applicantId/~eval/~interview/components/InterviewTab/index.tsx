import { cn } from '@yourssu-inhouse/interior-tailwind/utils';
import clsx from 'clsx';
import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { Activity, useId, useState } from 'react';

import { useInterviewAnalytics } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/analytics';

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
  const trackInterviewEvent = useInterviewAnalytics();
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<null | TTab>(tabs[0] ?? null);
  const isOpen = activeTab !== null;

  const handleTabClick = (nextTab: TTab) => {
    if (activeTab !== nextTab && nextTab === '지원서') {
      trackInterviewEvent('interview_application_card_open', {});
    }

    setActiveTab((previous) => (previous === nextTab ? null : nextTab));
  };

  return (
    <div className={cn('flex w-full', className)}>
      <LayoutGroup id={id}>
        <div aria-orientation="vertical" className="flex flex-col gap-1.5" role="tablist">
          {tabs.map((item) => {
            const isHighlighted = item === activeTab;
            const isTabbable = item === (activeTab ?? tabs[0]);

            return (
              <button
                aria-controls={`${id}-tabpanel-${item}`}
                aria-selected={isHighlighted}
                className={clsx(
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
                  className={clsx(
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
                    transition={{
                      type: 'spring',
                      bounce: 0,
                      duration: shouldReduceMotion ? 0 : 0.4,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </LayoutGroup>
      <motion.div
        animate={isOpen ? 'open' : 'closed'}
        className="min-h-0 overflow-hidden"
        initial={false}
        transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' }}
        variants={panelVariants}
      >
        {/* Activity가 내용을 숨겨도 너비를 유지해요. 이 래퍼가 없으면 auto 너비가 즉시 0이 되어 닫기 애니메이션이 사라져요. */}
        <div className="box-content h-full w-90 pl-3">
          {/* 탭 전환이나 닫기 시에도 각 탭의 DOM을 보존해 스크롤 위치를 유지하기 위해 Activity를 사용해요. */}
          {tabs.map((item) => (
            <Activity key={item} mode={item === activeTab ? 'visible' : 'hidden'}>
              <div
                aria-labelledby={`${id}-tab-${item}`}
                className="h-full"
                id={`${id}-tabpanel-${item}`}
                role="tabpanel"
              >
                {children({ tab: item })}
              </div>
            </Activity>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const panelVariants = {
  closed: { opacity: 0, width: 0 },
  open: { opacity: 1, width: 'auto' },
};
