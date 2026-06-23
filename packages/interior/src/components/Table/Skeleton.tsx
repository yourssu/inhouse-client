import { range } from 'es-toolkit';
import { motion } from 'motion/react';

import { Table } from './index';
import { Row } from './Row';

const MotionRow = motion.create(Row);

export const Skeleton = ({ count }: { count: number }) => {
  return (
    <Table rowCount={count}>
      <Table.Head>
        <Table.Th>ㅤ</Table.Th>
      </Table.Head>
      <Table.Body>
        {range(0, count).map((i) => (
          <MotionRow
            animate={{
              scale: [1, 0.96, 1],
              opacity: [1, 0.4, 1],
            }}
            key={i}
            transition={{
              type: 'tween',
              ease: 'easeOut',
              duration: 1.6,
              repeat: Infinity,
              delay: (i % 10) * 0.08,
            }}
          >
            <Table.Cell colSpan={100} />
          </MotionRow>
        ))}
      </Table.Body>
    </Table>
  );
};
