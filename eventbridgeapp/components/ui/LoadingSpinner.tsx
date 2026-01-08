import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ 
  message = "Loading...", 
  size = 'md' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-32 w-32',
    lg: 'h-48 w-48'
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutrals-01">
      <div className="text-center">
        <Loader2 
          className={`${sizeClasses[size]} text-primary-01 animate-spin mx-auto`}
        />
        <p className="mt-4 text-neutrals-06 text-lg font-medium">{message}</p>
      </div>
    </div>
  );
}