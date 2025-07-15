import { Button } from '@mui/material';
import React from 'react';

export default function MediaUploadTab({
  isActive,
  onClick,
  icon,
  label,
  examples,
}: {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  examples?: string;
}) {
  return (
    <Button
      variant="text"
      size="small"
      onClick={onClick}
      className={`border-mountain-200 flex w-1/2 items-center justify-start rounded-full border-1 bg-gradient-to-r px-3 shadow-sm transition-all duration-300 ${
        isActive
          ? 'bg-indigo-700 to-purple-400 text-white'
          : 'text-mountain-800 bg-white hover:brightness-95'
      }`}
      sx={{
        height: 40,
        borderRadius: '2px',
        textTransform: 'none',
        overflow: 'hidden', // MUI style fallback
      }}
    >
      <div className={`${isActive && 'text-mountain-50'} mr-1`}>{icon}</div>
      {/* ✅ Label + examples inline with truncation */}
      <div className="flex truncate overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap">
        <span className="mr-1">{label}</span>
        <span
          className={`${isActive ? 'text-mountain-200' : 'text-mountain-400'}`}
        >
          {examples}
        </span>
      </div>
    </Button>
  );
}
