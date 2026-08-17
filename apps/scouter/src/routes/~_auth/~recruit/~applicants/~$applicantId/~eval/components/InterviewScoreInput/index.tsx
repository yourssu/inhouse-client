import { cn } from '@yourssu-inhouse/interior-tailwind/utils';

interface InterviewScoreInputProps {
  ariaLabel: string;
  invalid: boolean;
  /** 지정하면 이 값을 초과해 입력할 수 없고, 자동으로 이 값으로 잘려요. */
  maxScore?: number;
  onBlur: () => void;
  onChange: (value: string) => void;
  value: string;
}

export const InterviewScoreInput = ({
  ariaLabel,
  invalid,
  maxScore,
  onBlur,
  onChange,
  value,
}: InterviewScoreInputProps) => (
  <input
    aria-invalid={invalid}
    aria-label={ariaLabel}
    className={cn(
      'h-lg rounded-8 border-grey200 focus:border-violet500 hover:not-focus:not-disabled:border-violetOpacity200 w-16 shrink-0 border px-3 text-right outline-none',
      invalid && 'border-red600',
    )}
    inputMode="numeric"
    onBlur={onBlur}
    onChange={(event) => {
      const nextValue = event.target.value;

      if (!/^\d*$/.test(nextValue)) {
        return;
      }

      if (maxScore != null && Number(nextValue) > maxScore) {
        onChange(maxScore.toString());
        return;
      }

      onChange(nextValue);
    }}
    type="text"
    value={value}
  />
);
