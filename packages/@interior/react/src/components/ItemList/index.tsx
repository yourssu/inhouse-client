import { RxQuestionMarkCircled } from 'react-icons/rx';

import { Divider } from '../Divider';
import { HoverTooltip } from '../HoverTooltip';
import { InlineButton } from '../InlineButton';
import * as styles from './ItemList.css';

const Header = ({ children }: React.PropsWithChildren<unknown>) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerInner}>{children}</div>
      <Divider className={styles.headerDivider} />
    </div>
  );
};

const HeaderButton = ({
  children,
  onClick,
}: React.PropsWithChildren<{ onClick?: React.MouseEventHandler }>) => {
  return (
    <InlineButton className={styles.headerButton} onClick={onClick}>
      {children}
    </InlineButton>
  );
};

const Body = ({ children }: React.PropsWithChildren<unknown>) => {
  return <div className={styles.body}>{children}</div>;
};

const Item = ({
  children,
  label,
  tooltipContent,
}: React.PropsWithChildren<{ label: string; tooltipContent?: string }>) => {
  return (
    <div className={styles.item}>
      <div className={styles.itemLabel}>
        <div>{label}</div>
        {tooltipContent && (
          <HoverTooltip content={tooltipContent} contentProps={{ side: 'bottom' }}>
            <RxQuestionMarkCircled />
          </HoverTooltip>
        )}
      </div>
      <div className={styles.itemValue}>{children}</div>
    </div>
  );
};

export const ItemList = ({ children }: React.PropsWithChildren<unknown>) => {
  return <div className={styles.container}>{children}</div>;
};

ItemList.Header = Header;
ItemList.Body = Body;
ItemList.Item = Item;
ItemList.HeaderButton = HeaderButton;
