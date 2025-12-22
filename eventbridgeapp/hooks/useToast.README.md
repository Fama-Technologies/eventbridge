# Sonner Toast System - Usage Guide

## Overview

Sonner is now set up to display beautiful toast notifications at the **top-center** of your app. Use it for success messages, errors, warnings, loading states, and more!

## Quick Start

```tsx
import { useToast } from '@/hooks/useToast';

export default function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Operation successful!', 'Your changes have been saved');
  };

  const handleError = () => {
    toast.error('Something went wrong', 'Please try again later');
  };

  return <button onClick={handleSuccess}>Save</button>;
}
```

## Toast Types

### Success Toast

```tsx
toast.success('Success!', 'Optional description');
```

### Error Toast

```tsx
toast.error('Error occurred', 'Error details here');
```

### Info Toast

```tsx
toast.info('Information', 'Some helpful info');
```

### Warning Toast

```tsx
toast.warning('Warning!', 'Please be careful');
```

### Loading Toast

```tsx
const loadingId = toast.loading('Uploading...', 'Please wait');

// Later, dismiss it
toast.dismiss(loadingId);
```

### Promise Toast (Auto handles loading/success/error)

```tsx
toast.promise(
  fetch('/api/data').then(r => r.json()),
  {
    loading: 'Loading data...',
    success: (data) => `Loaded ${data.length} items`,
    error: 'Failed to load data'
  }
);
```

## Direct Import Functions

For simple cases, import directly without using the hook:

```tsx
import { showSuccess, showError, showInfo, showWarning } from '@/hooks/useToast';

// Use anywhere
showSuccess('File uploaded successfully!');
showError('Failed to upload file');
```

## Common Use Cases

### Form Submission

```tsx
const handleSubmit = async (data: FormData) => {
  const loadingId = toast.loading('Submitting form...');
  
  try {
    await submitForm(data);
    toast.dismiss(loadingId);
    toast.success('Form submitted!', 'Your data has been saved');
  } catch (error) {
    toast.dismiss(loadingId);
    toast.error('Submission failed', error.message);
  }
};
```

### File Upload

```tsx
const handleFileUpload = async (file: File) => {
  toast.promise(
    uploadFile(file),
    {
      loading: 'Uploading file...',
      success: 'File uploaded successfully!',
      error: (err) => `Upload failed: ${err.message}`
    }
  );
};
```

### API Calls

```tsx
const fetchData = async () => {
  try {
    const data = await api.get('/data');
    toast.success('Data loaded!');
    return data;
  } catch (error) {
    toast.error('Failed to fetch data');
  }
};
```

### Delete Confirmation

```tsx
const handleDelete = async (id: string) => {
  const loadingId = toast.loading('Deleting item...');
  
  try {
    await deleteItem(id);
    toast.dismiss(loadingId);
    toast.success('Item deleted!');
  } catch (error) {
    toast.dismiss(loadingId);
    toast.error('Failed to delete');
  }
};
```

### Onboarding Flow

```tsx
// In VerifyStep.tsx
const handleSubmitDocuments = async () => {
  const id = toast.loading('Uploading documents...');
  
  try {
    await uploadDocuments(files);
    toast.dismiss(id);
    toast.success('Documents submitted!', 'Review process: 24-48 hours');
    onNext();
  } catch (error) {
    toast.dismiss(id);
    toast.error('Upload failed', 'Please try again');
  }
};
```

## API Reference

### useToast Hook

| Method | Parameters | Description |
|--------|------------|-------------|
| `success` | `(message, description?)` | Show success toast |
| `error` | `(message, description?)` | Show error toast |
| `info` | `(message, description?)` | Show info toast |
| `warning` | `(message, description?)` | Show warning toast |
| `loading` | `(message, description?)` | Show loading toast, returns ID |
| `promise` | `(promise, messages)` | Auto-handle promise states |
| `custom` | `(message, description?)` | Show custom toast |
| `dismiss` | `(id?)` | Dismiss specific toast |
| `dismissAll` | `()` | Dismiss all toasts |

### Direct Exports

- `showSuccess(message, description?)`
- `showError(message, description?)`
- `showInfo(message, description?)`
- `showWarning(message, description?)`
- `showLoading(message, description?)`
- `dismissToast(id?)`
- `dismissAllToasts()`

## Configuration

Toasts are configured to appear at **top-center** with:

- Rich colors for different toast types
- Close button
- Custom styling matching your design system
- Rounded corners and shadows

## Styling

Current custom classes (edit in `SonnerProvider.tsx`):

- Toast: `rounded-lg shadow-lg`
- Title: `text-sm font-semibold`
- Description: `text-xs`
- Action button: `bg-primary-01 text-white`
- Cancel button: `bg-neutrals-04`
- Close button: `bg-neutrals-02 hover:bg-neutrals-03`

## Examples in Your App

### In VerifyStep (File Upload)

```tsx
const handleFileUpload = (files: FileList) => {
  showInfo('Files selected', `${files.length} file(s) ready to upload`);
  // ... process files
};
```

### In Onboarding

```tsx
const handleNext = () => {
  showSuccess('Progress saved!', 'Moving to next step');
  onNext();
};
```

### In Forms

```tsx
const handleLogin = async (credentials) => {
  const id = showLoading('Signing in...');
  
  try {
    await login(credentials);
    dismissToast(id);
    showSuccess('Welcome back!');
    router.push('/dashboard');
  } catch (error) {
    dismissToast(id);
    showError('Login failed', 'Check your credentials');
  }
};
```
