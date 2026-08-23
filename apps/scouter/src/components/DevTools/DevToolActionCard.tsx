import { Button } from '@yourssu-inhouse/interior';
import { useId } from 'react';

interface DevToolActionCardProps {
  buttonText: string;
  description: string;
  disabled: boolean;
  disabledReason: string;
  onClick: () => void;
  title: string;
}

export const DevToolActionCard = ({
  buttonText,
  description,
  disabled,
  disabledReason,
  onClick,
  title,
}: DevToolActionCardProps) => {
  const disabledReasonId = useId();

  return (
    <article className="border-greyOpacity200 bg-lightBackground rounded-10 flex flex-col gap-3 border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-neutral font-semibold">{title}</h3>
          <p className="text-neutralSubtle text-sm leading-5">{description}</p>
        </div>
        <Button
          aria-describedby={disabled ? disabledReasonId : undefined}
          className="shrink-0"
          disabled={disabled}
          onClick={onClick}
          size="md"
          type="button"
          variant="danger"
        >
          {buttonText}
        </Button>
      </div>
      {disabled && (
        <p className="text-neutralSubtle text-xs" id={disabledReasonId}>
          {disabledReason}
        </p>
      )}
    </article>
  );
};
