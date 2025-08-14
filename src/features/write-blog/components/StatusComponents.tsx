import type { SaveStatus } from '@/hooks/useBlogState';
import React from 'react';
import { AutoSaveStatus } from './AutoSaveStatus';

const LoadingSpinner = ({ size = 'sm' }: { size?: 'sm' | 'lg' }) => (
  <div className={`loading-spinner${size === 'lg' ? '-large' : ''}`} />
);

const StatusIndicator = ({
  className,
  text,
}: {
  className: string;
  text: string;
}) => (
  <div className={`flex items-center space-x-2 text-sm ${className}`}>
    <div className="h-2 w-2 rounded-full bg-current opacity-60" />
    <span>{text}</span>
  </div>
);

interface EnhancedAutoSaveStatusProps {
  status: SaveStatus;
  lastSaved?: Date;
  isNewBlog: boolean;
  createdDocId: number | null;
  isCreating: boolean;
  hasContent: boolean;
}

export const EnhancedAutoSaveStatus = React.memo(
  ({
    status,
    lastSaved,
    isNewBlog,
    createdDocId,
    isCreating,
    hasContent,
  }: EnhancedAutoSaveStatusProps) => {
    if (isNewBlog && !createdDocId) {
      if (isCreating) {
        return (
          <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
            <LoadingSpinner />
            <span>Creating blog...</span>
          </div>
        );
      }

      if (!hasContent) {
        return (
          <StatusIndicator
            className="text-gray-500 dark:text-gray-400"
            text="Start typing to create blog"
          />
        );
      }
    }

    return <AutoSaveStatus status={status} lastSaved={lastSaved} />;
  },
);

export const LoadingScreen = () => (
  <div className="dark:bg-mountain-950 flex h-screen w-full items-center justify-center bg-white">
    <div className="flex flex-col items-center space-y-4">
      <LoadingSpinner size="lg" />
      <span className="text-gray-700 dark:text-gray-300">
        Loading editor data...
      </span>
    </div>
  </div>
);
