import React from 'react';
import { LuZoomIn, LuZoomOut } from 'react-icons/lu';

interface ZoomTool {
  zoomLevel: number;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
}

const ZoomTool: React.FC<ZoomTool> = ({
  zoomLevel,
  handleZoomIn,
  handleZoomOut,
}) => {
  return (
    <div className="border-mountain-200 absolute top-1/2 -right-14 flex h-48 w-12 -translate-y-1/2 transform flex-col items-center justify-between space-y-1 rounded-xl border bg-white p-1 opacity-50 duration-200 ease-in-out hover:opacity-100">
      <div
        onClick={handleZoomIn}
        className="hover:bg-mountain-50 flex h-[25%] w-full items-center justify-center rounded-lg select-none hover:cursor-pointer"
      >
        <LuZoomIn />
      </div>
      <div className="text-mountain-600 flex h-[50%] w-full items-center justify-center rounded-lg bg-indigo-50 p-2 text-sm font-medium">
        {Math.round(zoomLevel * 100)}%
      </div>
      <div
        onClick={handleZoomOut}
        className="hover:bg-mountain-50 flex h-[25%] w-full items-center justify-center rounded-lg select-none hover:cursor-pointer"
      >
        <LuZoomOut />
      </div>
    </div>
  );
};

export default ZoomTool;
