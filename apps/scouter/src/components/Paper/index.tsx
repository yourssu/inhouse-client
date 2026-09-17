import { cn } from '@interior/tailwind/utils';

export const Paper = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn('bg-lightBackground flex rounded-2xl p-6', className)} {...props}>
      {children}
    </div>
  );
};
