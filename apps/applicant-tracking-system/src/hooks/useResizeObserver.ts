import { usePreservedCallback, useRefEffect } from 'react-simplikit';

export const useResizeObserver = <E extends HTMLElement = HTMLElement>(
  onResize: (entry: ResizeObserverEntry) => void,
) => {
  const resizeCallback = usePreservedCallback(onResize);

  const ref = useRefEffect<E>(
    (elem) => {
      const observer = new ResizeObserver((entries) => {
        if (entries[0] != null) {
          resizeCallback(entries[0]);
        }
      });
      observer.observe(elem);
      return () => {
        observer.unobserve(elem);
      };
    },
    [resizeCallback],
  );

  return ref;
};
