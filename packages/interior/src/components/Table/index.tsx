import * as ScrollArea from '@radix-ui/react-scroll-area';
import clsx from 'clsx';
import React, { useState } from 'react';

import { Body } from './Body';
import { Cell } from './Cell';
import { TableContext } from './context';
import { Head } from './Head';
import { Row } from './Row';
import { Skeleton } from './Skeleton';
import * as styles from './Table.css';
import { Th, ThSelect } from './Th';

interface TableProps {
  className?: string;
  rowCount: number;
  stickyHorizontal?: boolean;
}

export const Table = ({
  children,
  className,
  rowCount,
  stickyHorizontal = false,
}: React.PropsWithChildren<TableProps>) => {
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollLeft > 0);
  };

  const tableContent = (
    <div style={{ minWidth: '100%' }}>
      <div style={{ position: 'relative', width: '100%', height: 48 * (rowCount + 1) }}>
        <table className={clsx(className)} style={{ width: '100%' }}>
          {children}
        </table>
      </div>
    </div>
  );

  return (
    <TableContext.Provider
      value={{ stickyHorizontal, showStickyShadow: stickyHorizontal && isScrolled }}
    >
      {stickyHorizontal ? (
        <ScrollArea.Root className={clsx('group/table', styles.scrollAreaRoot)}>
          <ScrollArea.Viewport className={styles.scrollAreaViewport} onScroll={handleScroll}>
            {tableContent}
          </ScrollArea.Viewport>

          <div className={styles.stickyIndicator({ scrolled: isScrolled })} />

          <ScrollArea.Scrollbar className={styles.scrollbar} orientation="horizontal">
            <ScrollArea.Thumb className={styles.thumb} />
          </ScrollArea.Scrollbar>
          <ScrollArea.Corner />
        </ScrollArea.Root>
      ) : (
        <div
          onScroll={handleScroll}
          style={{ width: '100%', overflowY: 'auto', padding: '6px 4px' }}
        >
          {tableContent}
        </div>
      )}
    </TableContext.Provider>
  );
};

Table.Head = Head;
Table.Body = Body;
Table.Row = Row;
Table.Cell = Cell;
Table.Th = Th;
Table.ThSelect = ThSelect;
Table.Skeleton = Skeleton;
