// components/PWAInstallPrompt.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 3 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if dismissed before
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = Math.floor((Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setShowPrompt(false);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
  };

  if (isInstalled || !showPrompt) return null;

  // iOS Install Instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-primary-01 shadow-2xl z-50 animate-slide-up">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 pr-12">
            <div className="bg-primary-01/10 p-3 rounded-lg flex-shrink-0">
              <Smartphone className="w-8 h-8 text-primary-01" />
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-2">Install EventBridge</h3>
              <p className="text-sm text-neutrals-06 mb-3">
                Add to your home screen for quick access
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <p className="font-medium">How to install:</p>
                <ol className="list-decimal list-inside space-y-1 text-neutrals-06">
                  <li>Tap the Share button (square with arrow)</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right corner</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Android/Desktop Install Prompt
  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 animate-slide-up">
      <div className="p-6">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="bg-primary-01/10 p-3 rounded-lg flex-shrink-0">
            <Download className="w-8 h-8 text-primary-01" />
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-1">Install EventBridge</h3>
            <p className="text-sm text-neutrals-06">
              Install our app for a better experience - works offline, faster access, and more!
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm"
          >
            Not Now
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 px-4 py-2 bg-primary-01 text-white rounded-lg hover:bg-primary-02 font-medium text-sm flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Install
          </button>
        </div>
      </div>
    </div>
  );
}