// components/MobileImageGrid.tsx

import React from 'react';

interface MobileImageGridProps {
  images: string[];
}

export const MobileImageGrid: React.FC<MobileImageGridProps> = ({ images }) => {
  if (images.length === 0) return null;

  if (images.length === 1 || images.length === 2) {
    return (
      <div className={`grid gap-1 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Image ${i + 1}`}
            className="w-full h-[200px] object-cover"
          />
        ))}
      </div>
    );
  }
  if (images.length === 3) {
    return (
      <div className="gap-1 grid grid-cols-2 h-[300px]">
        <img
          src={images[0]}
          alt="Image 1"
          className="col-span-1 w-full h-full object-cover"
        />
        <div className="flex flex-col gap-1 h-full">
          <img src={images[1]} alt="Image 2" className="w-full h-1/2 object-cover" />
          <img src={images[2]} alt="Image 3" className="w-full h-1/2 object-cover" />
        </div>
      </div>
    );
  }
  if (images.length >= 4) {
    return (
      <div className="gap-1 grid grid-cols-2 h-full">
        <img
          src={images[0]}
          alt="Image 1"
          className="col-span-1 w-full h-full object-cover"
        />
        <div className="gap-1 grid grid-cols-1 grid-rows-3 h-full">
          {images.slice(1, 4).map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Image ${i + 2}`}
              className="w-full h-full object-cover"
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
};
