export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'default';
export type ToastPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';

export interface IToast {
    type?: ToastType;
    heading?: string;
    message?: string | React.ReactNode;
    duration?: number;
}
