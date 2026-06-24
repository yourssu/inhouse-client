import { SegmentedControl } from '@yourssu-inhouse/interior';
import { useState } from 'react';

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
