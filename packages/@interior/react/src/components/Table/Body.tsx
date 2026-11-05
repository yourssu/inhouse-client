import * as styles from './Table.css';

export const Body = ({ children }: React.PropsWithChildren<unknown>) => {
  return <tbody className={styles.body}>{children}</tbody>;
};
