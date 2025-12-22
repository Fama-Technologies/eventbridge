'use client';

import { Toaster } from 'sonner';

export function SonnerProvider() {
    return (
        <Toaster
            position="top-center"
            richColors
            closeButton
            expand={false}
            toastOptions={{
                classNames: {
                    toast: 'rounded-lg shadow-lg',
                    title: 'text-sm font-semibold',
                    description: 'text-xs',
                    actionButton: 'bg-primary-01 text-white',
                    cancelButton: 'bg-neutrals-04',
                    closeButton: 'bg-neutrals-02 hover:bg-neutrals-03',
                },
            }}
        />
    );
}
