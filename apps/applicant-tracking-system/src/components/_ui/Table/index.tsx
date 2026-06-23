import type React from 'react';

import { Body } from '@/components/_ui/Table/Body';
import { Cell } from '@/components/_ui/Table/Cell';
import { Head } from '@/components/_ui/Table/Head';
import { Row } from '@/components/_ui/Table/Row';
import { Skeleton } from '@/components/_ui/Table/Skeleton';
import { Th, ThSelect } from '@/components/_ui/Table/Th';
import { cn } from '@/utils/tw';

export const Table = ({
  children,
  className,
  rowCount,
}: React.PropsWithChildren<{ className?: string; rowCount: number }>) => {
  return (
    <div className="overflow-y-auto px-1 pb-1">
      <div className="min-w-full">
        <div className="relative w-full" style={{ height: 48 * (rowCount + 1) }}>
          <table className={cn('w-full', className)}>{children}</table>
        </div>
      </div>
    </div>
  );
};

Table.Head = Head;
Table.Body = Body;
Table.Row = Row;
Table.Cell = Cell;
Table.Th = Th;
Table.ThSelect = ThSelect;
Table.Skeleton = Skeleton;
