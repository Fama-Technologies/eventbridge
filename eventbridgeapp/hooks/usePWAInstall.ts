// hooks/usePWAInstall.ts
'use client';

import { useEffect, useState } from 'react';

export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if install is available
    const handleBeforeInstallPrompt = () => {
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const showInstallPrompt = () => {
    if (isInstalled) {
      console.log('App is already installed');
      return false;
    }

    // Trigger custom event that PWAInstallPrompt listens to
    window.dispatchEvent(new Event('show-pwa-install'));
    return true;
  };

  return {
    isInstalled,
    canInstall,
    showInstallPrompt,
  };
}