import type { ReactNode } from 'react';

import { useState } from 'react';
import { useOutsideClickEffect } from 'react-simplikit';

interface DetectOutsideClickAreaProps {
  callback: () => void;
  children: ReactNode;
  extraContainers?: (HTMLElement | null)[];
}

export const DetectOutsideClickArea = ({
  children,
  callback,
  extraContainers = [],
}: DetectOutsideClickAreaProps) => {
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);

  useOutsideClickEffect([containerEl, ...extraContainers], callback);

  return <div ref={setContainerEl}>{children}</div>;
};
