// In Categories.tsx or your separate ImageWithFallback.tsx file

import React, { useEffect, useState } from 'react';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className: string;
  fallbackClassName?: string; // Still here, could be used for additional styling on the fallback img if needed
  // Add a specific prop for the fallback image source, or hardcode it
  fallbackSrc?: string; // Optional: if you want to make the fallback image configurable
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  fallbackClassName, // Can be used for specific styling on the fallback <img> wrapper if needed
  fallbackSrc = '/logo_app_v_101.png', // Default to your logo
}) => {
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    // Reset error and update currentSrc when the src prop changes
    setError(false);
    setCurrentSrc(src);
  }, [src]);

  const handleError = () => {
    setError(true);
    // Optionally, you could try to load the fallbackSrc directly here,
    // but rendering a different img tag is cleaner for React.
  };

  if (error || !currentSrc) {
    // Render fallback image
    return (
      <img
        src={fallbackSrc} // Use the provided or default fallback source
        alt={`${alt} (fallback)`} // Indicate it's a fallback
        className={`${className} ${fallbackClassName || ''}`} // Apply same class for sizing and styling
        // You might not want onError for the fallback itself, or handle it differently
        // onError={() => console.warn(`Fallback image ${fallbackSrc} also failed to load.`)}
      />
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};
