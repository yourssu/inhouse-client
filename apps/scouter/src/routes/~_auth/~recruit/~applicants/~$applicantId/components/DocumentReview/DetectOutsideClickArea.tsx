import type { ReactNode } from 'react';

import { useState } from 'react';
import { useOutsideClickEffect } from 'react-simplikit';

interface DetectOutsideClickAreaProps {
  children: ReactNode;
  onClickOutside: () => void;
}

export const DetectOutsideClickArea = ({
  children,
  onClickOutside,
}: DetectOutsideClickAreaProps) => {
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);

  useOutsideClickEffect([containerEl], onClickOutside);

  return <div ref={setContainerEl}>{children}</div>;
};
