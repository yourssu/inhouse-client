import { type RefObject, useEffect } from 'react';

/**
 * 지원자 선택 시 가장 이른 희망 블럭으로 자동 스크롤합니다.
 * displayDate 변경 후 DOM 업데이트를 기다린 뒤 스크롤합니다.
 */
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
