import { type RefObject, useEffect } from 'react';

export const useScrollToAvailableSlot = (
  containerRef: RefObject<HTMLDivElement | null>,
  activeApplicantId: null | number,
  hasAvailableTimes: boolean,
) => {
  useEffect(() => {
    if (!activeApplicantId || !hasAvailableTimes || !containerRef.current) {
      return;
    }

    const timerId = setTimeout(() => {
      if (!containerRef.current) {
        return;
      }

      const firstAvailable = containerRef.current.querySelector('[data-available-time]');
      firstAvailable?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);

    return () => clearTimeout(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeApplicantId]);
};
