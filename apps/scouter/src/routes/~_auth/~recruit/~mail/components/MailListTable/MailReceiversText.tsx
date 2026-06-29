import { HoverTooltip } from '@yourssu-inhouse/interior';

interface MailReceiversTextProps {
  receivers: string[];
}

export const MailReceiversText = ({ receivers }: MailReceiversTextProps) => {
  const hasMultipleReceivers = receivers.length > 1;

  if (hasMultipleReceivers) {
    return (
      <HoverTooltip
        content={
          <div className="flex flex-col gap-1">
            {receivers.map((r, i) => (
              <span key={i}>{r}</span>
            ))}
          </div>
        }
      >
        <span className="cursor-help underline decoration-dashed underline-offset-2">
          {receivers[0]} 외 {receivers.length - 1}명
        </span>
      </HoverTooltip>
    );
  }

  return <span>{receivers[0]}</span>;
};
