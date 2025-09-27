import { create } from 'zustand';

type ToastType = 'info' | 'success' | 'error';

interface ToastState {
  message: string | null;
  type: ToastType;
  visible: boolean;
  show: (message: string, type?: ToastType) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: 'info',
  visible: false,
  show: (message: string, type: ToastType = 'info') => {
    set({ message, type, visible: true });
  },
  hide: () => set({ visible: false, message: null }),
}));

export default useToastStore;
