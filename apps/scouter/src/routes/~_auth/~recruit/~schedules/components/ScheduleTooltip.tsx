import * as Tooltip from '@radix-ui/react-tooltip';
import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';

import type { ApplicantType } from '@/apis/applicants/schema';

import { partNameKo } from '@/types/parts';
import { formatSemester } from '@/utils/semester';

export const ScheduleTooltip = ({ children }: React.PropsWithChildren) => (
  <Tooltip.Provider delayDuration={0} skipDelayDuration={0}>
    <Tooltip.Root>{children}</Tooltip.Root>
  </Tooltip.Provider>
);

const ScheduleTooltipTrigger = ({ children }: React.PropsWithChildren) => (
  <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
);

type ScheduleTooltipContentProps = React.PropsWithChildren<{
  applicant: ApplicantType;
  contentProps?: Tooltip.TooltipContentProps;
  left?: string;
}>;

const ScheduleTooltipContent = ({
  applicant,
  children,
  contentProps,
  left,
}: ScheduleTooltipContentProps) => (
  <Tooltip.Portal>
    <Tooltip.Content
      align="start"
      className="bg-backgroundLevel02 shadow-tooltip z-20 min-w-60 rounded-[14px] px-5.5 py-4.5"
      side="bottom"
      sideOffset={5}
      {...contentProps}
    >
      <div className="text-15 flex flex-col gap-4.5">
        <div className="flex flex-col gap-0.5">
          <div className="text-17 font-semibold">{applicant.name}</div>
          <div className="text-neutralSubtle text-13">
            {applicant.age}세 · {formatSemester(applicant.semester)}
          </div>
          <div className="text-neutralSubtle text-13">
            <span>{partNameKo[applicant.part]} 파트</span>
            <span className="ml-1">
              {formatTemplates['1월 1일'](applicant.applicationDate)}에 지원
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {children}
          {left != null && <span className="text-violet600 text-13 mt-2.5">{left}</span>}
        </div>
      </div>
    </Tooltip.Content>
  </Tooltip.Portal>
);

type ScheduleTooltipItemProps = React.PropsWithChildren<{
  icon: React.ComponentType<{ className?: string }>;
  right?: React.ReactNode;
}>;

const ScheduleTooltipItem = ({ icon: Icon, right, children }: ScheduleTooltipItemProps) => {
  const content = (
    <div className="flex items-center gap-2">
      <Icon className="text-neutralDisabled size-6" />
      <span>{children}</span>
    </div>
  );

  if (right == null) {
    return content;
  }

  return (
    <div className="flex items-center justify-between gap-2">
      {content}
      {right}
    </div>
  );
};

ScheduleTooltip.Trigger = ScheduleTooltipTrigger;
ScheduleTooltip.Content = ScheduleTooltipContent;
ScheduleTooltip.Item = ScheduleTooltipItem;
