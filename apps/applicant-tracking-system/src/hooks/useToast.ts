import { useToastContext } from '@/components/_ui/Toast/context';

export const useToast = () => {
  const { addToast } = useToastContext();

  return {
    success: (text: string) => addToast({ text, type: 'success' }),
    error: (text: string) => addToast({ text, type: 'error' }),
    default: (text: string) => addToast({ text, type: 'default' }),
  };
};
