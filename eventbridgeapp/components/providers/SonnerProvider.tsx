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
                    toast: 'bg-[#222222] border border-[#333333] text-white',
                    title: 'text-sm font-semibold text-white',
                    description: 'text-xs text-[#888888]',
                    actionButton: 'bg-[#FF7043] text-white hover:bg-[#FF8A65]',
                    cancelButton: 'bg-[#333333] text-white hover:bg-[#444444]',
                    closeButton: 'bg-[#222222] text-[#888888] hover:text-white border-[#333333] hover:bg-[#333333]',
                    success: 'text-[#FF7043] border-[#FF7043]/20',
                    error: 'text-red-500 border-red-500/20',
                    info: 'text-blue-500 border-blue-500/20',
                    warning: 'text-yellow-500 border-yellow-500/20',
                },
            }}
        />
    );
}
