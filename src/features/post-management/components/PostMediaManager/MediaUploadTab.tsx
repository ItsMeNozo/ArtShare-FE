import React from "react";
import { Button } from "@mui/material";

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
      className={`flex items-center bg-gradient-to-r rounded-full border-1 border-mountain-200 shadow-sm justify-start px-3 w-1/2 transition-all duration-300 ${isActive
        ? "bg-indigo-700 to-purple-400 text-white"
        : "bg-mountain-50 hover:bg-mountain-100 text-mountain-800"
        }`}
      sx={{
        height: 40,
        borderRadius: "2px",
        textTransform: "none",
        overflow: "hidden", // MUI style fallback
      }}
    >
      <div className={`${isActive && "text-mountain-50"} mr-1`}>{icon}</div>
      {/* ✅ Label + examples inline with truncation */}
      <div className="flex overflow-hidden font-medium text-sm truncate text-ellipsis whitespace-nowrap">
        <span className="mr-1">{label}</span>
        <span className={`${isActive ? 'text-mountain-200' : 'text-mountain-400'}`}>{examples}</span>
      </div>
    </Button>
  );
}
