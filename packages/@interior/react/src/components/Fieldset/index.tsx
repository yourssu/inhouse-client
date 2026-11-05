import clsx from 'clsx';

import * as styles from './Fieldset.css';

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
    <fieldset className={clsx(styles.root, className)}>
      {label && <div className={styles.label}>{label}</div>}
      {children}
      {help && <div className={styles.help}>{help}</div>}
    </fieldset>
  );
};
