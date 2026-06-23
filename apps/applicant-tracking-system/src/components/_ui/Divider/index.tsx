import { cn } from '@/utils/tw';

export const Divider = ({ className }: { className?: string }) => {
  return <div className={cn('bg-greyOpacity200 h-px w-full', className)} />;
};
