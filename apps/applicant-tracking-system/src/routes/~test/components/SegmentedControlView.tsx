import { useState } from 'react';

import { SegmentedControl } from '@/components/_ui/SegmentedControl';

export const SegmentedControlView = () => {
  const [segmentValue, setSegmentValue] = useState<'a' | 'b' | 'c'>('a');

  return (
    <>
      <div className="flex gap-4">
        <SegmentedControl
          items={['a', 'b', 'c']}
          onValueChange={setSegmentValue}
          value={segmentValue}
        />
      </div>
    </>
  );
};
