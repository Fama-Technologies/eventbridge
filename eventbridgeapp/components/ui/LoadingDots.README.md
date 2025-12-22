# LoadingDots Component - Usage Guide

## Overview

A beautiful animated loading component with three colored dots that dance and rotate with a smooth gooey effect. Perfect for loading states throughout your application.

## Import

```tsx
import LoadingDots from '@/components/ui/LoadingDots';
```

## Basic Usage

```tsx
<LoadingDots />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional CSS classes |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the loader |

## Sizes

### Small (`sm`)

- Container: 96px × 96px
- Dots: 32px × 32px
- Use for: Inline loading, small cards, buttons

```tsx
<LoadingDots size="sm" />
```

### Medium (`md`) - Default

- Container: 128px × 128px  
- Dots: 48px × 48px
- Use for: Modal dialogs, content areas

```tsx
<LoadingDots size="md" />
```

### Large (`lg`)

- Container: 192px × 192px
- Dots: 64px × 64px
- Use for: Full-page loading, splash screens

```tsx
<LoadingDots size="lg" />
```

## Common Use Cases

### Full Page Loading

```tsx
<div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
  <LoadingDots size="lg" />
</div>
```

### Loading State in Card

```tsx
{isLoading ? (
  <div className="flex items-center justify-center h-64">
    <LoadingDots size="md" />
  </div>
) : (
  <YourContent />
)}
```

### Button Loading State

```tsx
<button disabled={isLoading} className="relative">
  {isLoading ? (
    <LoadingDots size="sm" className="mx-auto" />
  ) : (
    'Submit'
  )}
</button>
```

### PDF Preview Loading (Already Integrated)

The component is already integrated into `PDFPreview.tsx` to show while PDFs are rendering.

## Features

- ✨ **Smooth Animations** - Fluid motion with CSS animations
- 🎨 **Beautiful Colors** - Yellow (#ffc400), Blue (#0051ff), Red (#ff1717)
- 🌊 **Gooey Effect** - SVG filter creates a liquid morphing effect
- 📱 **Responsive** - Three size options for different use cases
- ⚡ **Performant** - Pure CSS animations, no JavaScript overhead

## Customization

### Custom Colors

Edit the component file to change colors:

```tsx
// In LoadingDots.tsx
<div className="bg-[#yourcolor]"></div>
```

### Custom Size

Pass additional classes:

```tsx
<LoadingDots className="scale-150" />
```

## Animation Details

- **Duration**: 2 seconds per cycle
- **Timing**: Ease-in-out for smooth motion
- **Pattern**: Dots move in a coordinated dance, rotate container 360°
- **Z-index**: Dots alternate stacking order for depth effect
