import * as styles from './Table.css';

export const Head = ({ children }: React.PropsWithChildren<unknown>) => {
  return (
    <thead className={styles.head}>
      <tr className={styles.headRow}>{children}</tr>
    </thead>
  );
};
