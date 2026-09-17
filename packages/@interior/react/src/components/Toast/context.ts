import { assert } from 'es-toolkit';
import { createContext, useContext } from 'react';

import type { ToastItem, ToastType } from '@/components/Toast/type';

interface ToastContextProps {
  addToast: (props: { text: string; type: ToastType }) => void;
  toasts: ToastItem[];
}

export const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  assert(!!context, 'useToastContext는 ToastProvider 하위에서만 사용할 수 있어요.');
  return context;
};
