'use client';

import { useTheme } from '@/providers/theme-provider';
import { Moon, Sun, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes: Array<{
    value: 'light' | 'dark' | 'system';
    icon: any;
    label: string;
  }> = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' }
  ];

  return (
    <div className="flex items-center gap-2 p-1 rounded-lg bg-neutrals-02">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
            theme === value
              ? 'bg-primary-01 text-shades-white shadow-sm'
              : 'text-neutrals-07 hover:bg-neutrals-03 hover:text-shades-black'
          }`}
          title={label}
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}
