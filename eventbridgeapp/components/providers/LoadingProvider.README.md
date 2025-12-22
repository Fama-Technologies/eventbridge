# Global Loading System - Usage Guide

## Overview

A global loading overlay system that displays the beautiful animated LoadingDots component during page transitions, form submissions, or any async operations.

## Components

### LoadingProvider

Context provider that wraps your entire app and manages global loading state.

### useLoading Hook

Hook to control the global loading state from anywhere in your app.

## Setup

The LoadingProvider is already integrated in `app/layout.tsx`:

```tsx
<LoadingProvider>
  <YourApp />
</LoadingProvider>
```

## Usage

### Basic Usage

```tsx
'use client';

import { useLoading } from '@/components/providers/LoadingProvider';

export default function MyComponent() {
  const { startLoading, stopLoading } = useLoading();

  const handleSubmit = async () => {
    startLoading();
    
    try {
      await someAsyncOperation();
    } finally {
      stopLoading();
    }
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

### With State Setter

```tsx
const { setLoading } = useLoading();

// Start loading
setLoading(true);

// Stop loading
setLoading(false);
```

### Check Loading State

```tsx
const { isLoading } = useLoading();

if (isLoading) {
  // Loading is active
}
```

## Common Use Cases

### Form Submission

```tsx
const handleLogin = async (formData: FormData) => {
  startLoading();
  
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      router.push('/dashboard');
    }
  } catch (error) {
    console.error(error);
  } finally {
    stopLoading();
  }
};
```

### Page Navigation

```tsx
const navigateToPage = () => {
  startLoading();
  router.push('/another-page');
  // Loading will auto-stop after navigation
};
```

### API Calls

```tsx
useEffect(() => {
  const fetchData = async () => {
    startLoading();
    
    try {
      const data = await fetch('/api/data').then(r => r.json());
      setData(data);
    } finally {
      stopLoading();
    }
  };
  
  fetchData();
}, []);
```

### Multiple Operations

```tsx
const handleMultipleOperations = async () => {
  startLoading();
  
  try {
    await operation1();
    await operation2();
    await operation3();
  } finally {
    stopLoading();
  }
};
```

## Features

- ✨ **Full-Screen Overlay** - Covers entire viewport with backdrop blur
- 🎨 **Themed** - Supports light/dark mode automatically
- 🔒 **Prevents Interaction** - Blocks user input while loading
- ⚡ **High Z-Index** - Appears above all content (z-index: 9999)
- 🎯 **Centered Animation** - LoadingDots centered with "Loading..." text

## API Reference

### useLoading Hook

Returns an object with:

| Property | Type | Description |
|----------|------|-------------|
| `isLoading` | `boolean` | Current loading state |
| `startLoading` | `() => void` | Start loading |
| `stopLoading` | `() => void` | Stop loading |
| `setLoading` | `(loading: boolean) => void` | Set loading state directly |

## Tips

### Always Use finally

```tsx
// ✅ Good
try {
  await operation();
} finally {
  stopLoading(); // Always runs
}

// ❌ Bad
await operation();
stopLoading(); // Won't run if error occurs
```

### Debounce Quick Operations

For operations that may complete very quickly (< 300ms), consider adding a minimum display time:

```tsx
const handleQuickOperation = async () => {
  startLoading();
  
  const [result] = await Promise.all([
    quickOperation(),
    new Promise(resolve => setTimeout(resolve, 300))
  ]);
  
  stopLoading();
};
```

### Multiple Parallel Operations

```tsx
const { isLoading, setLoading } = useLoading();

const handleParallel = async () => {
  setLoading(true);
  
  await Promise.all([
    operation1(),
    operation2(),
    operation3()
  ]);
  
  setLoading(false);
};
```

## Styling

The overlay uses these Tailwind classes:

- `fixed inset-0` - Full screen
- `bg-white/90 dark:bg-black/90` - Semi-transparent background with theme support
- `backdrop-blur-sm` - Blur effect
- `z-[9999]` - Highest layer

To customize, edit `LoadingProvider.tsx`:

```tsx
<div className="fixed inset-0 bg-your-custom-bg ...">
  <LoadingDots size="lg" />
</div>
```
