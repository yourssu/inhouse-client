import { cn } from '@/utils/tw';

interface FieldsetProps {
  className?: string;
  help?: React.ReactNode;
  label?: React.ReactNode;
}

export const Fieldset = ({
  className,
  label,
  help,
  children,
}: React.PropsWithChildren<FieldsetProps>) => {
  if (!label && !help) {
    return children;
  }

  return (
    <fieldset className={cn('w-full', className)}>
      {label && <div className="text-15 text-neutralMuted py-1.5 font-normal">{label}</div>}
      {children}
      {help && <div className="text-neutralSubtle text-13 mt-1.5 font-normal">{help}</div>}
    </fieldset>
  );
};
