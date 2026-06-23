import { Fieldset } from '@/components/_ui/Fieldset';
import { cn, tv } from '@/utils/tw';

export type TextFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  description?: React.ReactNode;
  invalid?: boolean;
  label?: React.ReactNode;
  size: 'lg' | 'md';
  variant: 'dimmed' | 'outline';
};

const textField = tv({
  base: 'ease-ease disabled:bg-greyOpacity200 w-full rounded-lg px-4 py-0 outline-0 transition-colors duration-200 disabled:cursor-not-allowed',
  variants: {
    variant: {
      outline: 'disabled:border-greyOpacity50 border',
      dimmed: 'bg-greyOpacity100',
    },
    size: {
      md: 'h-8 text-sm',
      lg: 'text-15 h-9.5',
    },
    invalid: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    { variant: 'outline', invalid: true, className: 'border-red500' },
    {
      variant: 'outline',
      invalid: false,
      className: 'border-grey200 focus:border-violet500 hover:border-violetOpacity200',
    },
    { variant: 'dimmed', invalid: true, className: 'ring-red500 ring-1' },
  ],
  defaultVariants: {
    invalid: false,
  },
});

export const TextField = ({
  className,
  description,
  invalid,
  label,
  size,
  variant,
  ...props
}: TextFieldProps) => {
  return (
    <Fieldset help={description} label={label}>
      <input
        className={cn(textField({ variant, size, invalid }), className)}
        type="text"
        {...props}
      />
    </Fieldset>
  );
};
