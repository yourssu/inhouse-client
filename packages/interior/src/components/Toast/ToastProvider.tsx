import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { ToastItem, ToastType } from './type';

import { ToastContext } from './context';
import { ToastAnimationGroup } from './ToastAnimationGroup';

interface ToastProviderProps {
  duration: number;
}

export const ToastProvider = ({
  duration,
  children,
}: React.PropsWithChildren<ToastProviderProps>) => {
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const current = timeouts.current;
    return () => {
      current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const addToast = ({ text, type }: { text: string; type: ToastType }) => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, text, type }]);

    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);

    timeouts.current.push(timeout);
  };

  return (
    <ToastContext.Provider value={{ addToast, toasts }}>
      {children}
      <ToastAnimationGroup />
    </ToastContext.Provider>
  );
};
