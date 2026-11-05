export type ToastType = 'default' | 'error' | 'success';

export type ToastItem = {
  id: string;
  text: string;
  type: ToastType;
};
