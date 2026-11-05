import * as styles from './Result.css';

interface ResultProps {
  description?: string;
  figure?: React.ReactNode;
  title: string;
}

export const Result = ({ description, figure, title }: ResultProps) => {
  return (
    <div className={styles.container}>
      {figure && <div className={styles.figureWrapper}>{figure}</div>}
      <span className={styles.titleText}>{title}</span>
      {description && <span className={styles.descriptionText}>{description}</span>}
    </div>
  );
};
