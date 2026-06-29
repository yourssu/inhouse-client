import { HoverTooltip } from '@yourssu-inhouse/interior';
import { tv } from '@yourssu-inhouse/interior-tailwind/utils';
import { RxQuestionMarkCircled } from 'react-icons/rx';

import { Paper } from '@/components/Paper';
import { MailStatusPaperSkeleton } from '@/routes/~_auth/~recruit/~mail/components/MailStatusGrid/MailStatusPaperSkeleton';

interface MailStatusPaperProps {
  color: 'blue' | 'orange' | 'red';
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  tooltipContent?: string;
}

const iconWrapper = tv({
  base: 'flex size-11 shrink-0 items-center justify-center rounded-xl',
  variants: {
    color: {
      orange: 'bg-orange50 text-orange500',
      blue: 'bg-green50 text-green500',
      red: 'bg-red50 text-red500',
    },
  },
});

export const MailStatusPaper = ({
  children,
  color,
  icon,
  label,
  tooltipContent,
  right,
}: React.PropsWithChildren<MailStatusPaperProps>) => {
  return (
    <Paper className="flex items-center justify-between p-3">
      <div className="flex items-center gap-3">
        <div className={iconWrapper({ color })}>{icon}</div>
        <div className="flex flex-col">
          <div className="text-neutralSubtle text-13 flex items-center gap-1">
            <div className="font-medium">{label}</div>
            {tooltipContent && (
              <HoverTooltip content={tooltipContent} contentProps={{ side: 'bottom' }}>
                <RxQuestionMarkCircled />
              </HoverTooltip>
            )}
          </div>
          <div className="text-17 font-semibold">{children}</div>
        </div>
      </div>
      {right}
    </Paper>
  );
};

MailStatusPaper.Skeleton = MailStatusPaperSkeleton;
