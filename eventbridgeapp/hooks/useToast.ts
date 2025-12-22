import { toast } from 'sonner';

/**
 * Utility hook for toast notifications
 * Uses Sonner library with custom presets
 */
export const useToast = () => {
    return {
        // Success toast
        success: (message: string, description?: string) => {
            toast.success(message, { description });
        },

        // Error toast
        error: (message: string, description?: string) => {
            toast.error(message, { description });
        },

        // Info toast
        info: (message: string, description?: string) => {
            toast.info(message, { description });
        },

        // Warning toast
        warning: (message: string, description?: string) => {
            toast.warning(message, { description });
        },

        // Loading toast (returns ID for dismissal)
        loading: (message: string, description?: string) => {
            return toast.loading(message, { description });
        },

        // Promise toast (auto handles loading/success/error)
        promise: <T,>(
            promise: Promise<T>,
            messages: {
                loading: string;
                success: string | ((data: T) => string);
                error: string | ((error: any) => string);
            }
        ) => {
            return toast.promise(promise, messages);
        },

        // Custom toast
        custom: (message: string, description?: string) => {
            toast(message, { description });
        },

        // Dismiss toast by ID
        dismiss: (id?: string | number) => {
            toast.dismiss(id);
        },

        // Dismiss all toasts
        dismissAll: () => {
            toast.dismiss();
        },
    };
};

// Direct exports for convenience
export const showSuccess = (message: string, description?: string) => {
    toast.success(message, { description });
};

export const showError = (message: string, description?: string) => {
    toast.error(message, { description });
};

export const showInfo = (message: string, description?: string) => {
    toast.info(message, { description });
};

export const showWarning = (message: string, description?: string) => {
    toast.warning(message, { description });
};

export const showLoading = (message: string, description?: string) => {
    return toast.loading(message, { description });
};

export const dismissToast = (id?: string | number) => {
    toast.dismiss(id);
};

export const dismissAllToasts = () => {
    toast.dismiss();
};
