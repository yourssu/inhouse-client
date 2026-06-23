import { cn } from '@/utils/tw';

export const VerticalDivider = ({ className }: { className?: string }) => {
  return <div className={cn('bg-greyOpacity200 min-h-full w-px self-stretch', className)} />;
};
