import { HorizontalSlider } from '@/components/sliders/HorizontalSlider';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Category } from '@/types';
import React from 'react';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import './scrollbar.css';
import { Skeleton } from '@/components/ui/skeleton';

export interface MediumSliderProps {
  onSelectCategory: (categoryName: string | null) => void;
  selectedCategory: string | null;
  data: Category[];
  isLoading?: boolean;
  isError?: boolean;
}

export const MediumSlider: React.FC<MediumSliderProps> = ({
  onSelectCategory,
  selectedCategory,
  data,
  isLoading,
  isError,
}) => {
  const renderCategoryItemInSlider = (category: Category) => {
    const isSelected = selectedCategory === category.name;
    const imageUrl =
      category.exampleImages && category.exampleImages.length > 0
        ? category.exampleImages[0]
        : undefined;

    return (
      <div
        className={`category-item flex max-w-48 items-center justify-center ${isSelected
          ? 'bg-mountain-200 dark:bg-mountain-800'
          : 'hover:bg-mountain-100 dark:hover:bg-mountain-900'
          } cursor-pointer gap-2 rounded-lg border p-2 ${isSelected ? 'border-primary-500' : 'border-transparent'
          }`}
        onClick={() => onSelectCategory(category.name)}
        title={category.name}
      >
        <ImageWithFallback
          src={imageUrl}
          alt={category.name}
          className="border dark:border-mountain-700 rounded-lg w-10 h-10 object-center object-cover aspect-[1/1]"
        />
        <span className="text-mountain-800 dark:text-mountain-200 text-sm line-clamp-2">
          {category.name}
        </span>
      </div>
    );
  };

  const getCategoryIdForSlider = (category: Category): string => {
    return category.id.toString();
  };

  if (isLoading) {
    return (
      <div className="flex gap-2 p-2 h-full">
        <Skeleton className="bg-mountain-200/60 w-48 h-10" />
        <Skeleton className="bg-mountain-200/60 w-48 h-10" />
        <Skeleton className="bg-mountain-200/60 w-48 h-10" />
        <Skeleton className="bg-mountain-200/60 w-48 h-10" />
        <Skeleton className="bg-mountain-200/60 w-48 h-10" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-grow justify-center items-center p-4 min-h-[76px] text-red-500 text-center">
        Failed to load attributes.
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-grow justify-center items-center p-4 min-h-[76px] text-gray-500 text-center">
        No attributes found.
      </div>
    );
  }

  return (
    <HorizontalSlider
      data={data}
      renderItem={renderCategoryItemInSlider}
      getItemId={getCategoryIdForSlider}
    />
  );
};
