'use client';

import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import LoadingDots from '../ui/LoadingDots';

interface LoadingContextType {
    isLoading: boolean;
    startLoading: () => void;
    stopLoading: () => void;
    setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);

    const startLoading = () => setIsLoading(true);
    const stopLoading = () => setIsLoading(false);
    const setLoading = (loading: boolean) => setIsLoading(loading);

    return (
        <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, setLoading }}>
            {children}

            {/* Global Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center">
                    <div className="text-center">
                        <LoadingDots size="lg" />
                        <p className="mt-6 text-sm text-neutrals-07">Loading...</p>
                    </div>
                </div>
            )}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
}
