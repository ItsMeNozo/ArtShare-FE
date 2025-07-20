import { HorizontalSlider } from '@/components/sliders/HorizontalSlider';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Skeleton } from '@/components/ui/skeleton';
import { Category } from '@/types';
import React from 'react';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import './scrollbar.css';

export interface AttributeSliderProps {
  onSelectCategory: (categoryName: string | null) => void;
  selectedCategory: string | null;
  data: Category[];
  isLoading?: boolean;
  isError?: boolean;
}

export const AttributeSlider: React.FC<AttributeSliderProps> = ({
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
        className={`category-item flex max-w-48 items-center justify-center ${
          isSelected
            ? 'bg-mountain-200 dark:bg-mountain-800'
            : 'hover:bg-mountain-100 dark:hover:bg-mountain-900'
        } cursor-pointer gap-2 rounded-lg border p-2 ${
          isSelected ? 'border-primary-500' : 'border-transparent'
        }`}
        onClick={() => onSelectCategory(category.name)}
        title={category.name}
      >
        <ImageWithFallback
          src={imageUrl}
          alt={category.name}
          className="dark:border-mountain-700 aspect-[1/1] h-10 w-10 rounded-lg border object-cover object-center"
        />
        <span className="text-mountain-800 dark:text-mountain-200 line-clamp-2 text-sm">
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
      <div className="flex h-full gap-2 p-2">
        <Skeleton className="bg-mountain-200/60 h-10 w-48" />
        <Skeleton className="bg-mountain-200/60 h-10 w-48" />
        <Skeleton className="bg-mountain-200/60 h-10 w-48" />
        <Skeleton className="bg-mountain-200/60 h-10 w-48" />
        <Skeleton className="bg-mountain-200/60 h-10 w-48" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[76px] flex-grow items-center justify-center p-4 text-center text-red-500">
        Failed to load attributes.
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex min-h-[76px] flex-grow items-center justify-center p-4 text-center text-gray-500">
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
