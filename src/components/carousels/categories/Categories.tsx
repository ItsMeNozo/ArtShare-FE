import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { cn } from '@/lib/utils';
import { Category } from '@/types';
import {
  Button,
  Fade,
  Input,
  Paper,
  Popper,
  PopperPlacementType,
} from '@mui/material';
import { LoaderPinwheel } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import { FiSearch } from 'react-icons/fi';
import { TiDeleteOutline } from 'react-icons/ti';
import { HorizontalSlider } from '../../sliders/HorizontalSlider';
import './Categories.css';

export interface CategoriesScrollerProps {
  onSelectCategory: (categoryName: string | null) => void;
  selectedCategory: string | null;
  data: Category[];
  isLoading?: boolean;
  isError?: boolean;
}

export const Categories: React.FC<CategoriesScrollerProps> = ({
  onSelectCategory,
  selectedCategory,
  data,
  isLoading,
  isError,
}) => {
  const renderCategoryItemInSlider = (category: Category) => {
    const isSelected = selectedCategory === category.name;
    const imageUrl =
      category.example_images && category.example_images.length > 0
        ? category.example_images[0]
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
      <div className="flex min-h-[76px] flex-grow items-center justify-center p-4">
        <LoaderPinwheel className="text-primary-500 h-8 w-8 animate-spin" />
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

interface DataPopperProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSave: (selectedData: string[] | string | null) => void;
  selectedData: string[] | string | null;
  data: Category[];
  renderItem: 'category' | 'prop';
  placement?: PopperPlacementType;
  className?: string;
  selectionMode?: 'single' | 'multiple';
  showClearAllButton?: boolean;
}

const renderCategoryItemForPopper = (
  item: Category,
  isSelected: boolean,
  onClick: () => void,
) => {
  const imageUrl =
    item.example_images && item.example_images.length > 0
      ? item.example_images[0]
      : undefined;

  return (
    <div
      className={`flex cursor-pointer items-center ${
        isSelected
          ? 'bg-mountain-200 dark:bg-mountain-800'
          : 'hover:bg-mountain-100 dark:hover:bg-mountain-900'
      } my-2 gap-2 rounded-lg p-2`}
      onClick={onClick}
    >
      <ImageWithFallback
        src={imageUrl}
        alt={item.name}
        className="aspect-[1/1] h-12 w-12 rounded-lg object-cover object-center"
      />
      <span className="dark:text-mountain-200 text-sm text-wrap text-gray-800">
        {item.name}
      </span>
    </div>
  );
};

const renderPropItemForPopper = (
  item: Category,
  isSelected: boolean,
  onClick: () => void,
) => (
  <div
    className="hover:bg-mountain-100 dark:hover:bg-mountain-900 flex cursor-pointer items-center gap-2 rounded-lg p-2"
    onClick={onClick}
  >
    <input
      type="checkbox"
      id={`prop-${item.id}-${item.name}`}
      checked={isSelected}
      className="pointer-events-none"
      readOnly
    />
    <label
      htmlFor={`prop-${item.id}-${item.name}`}
      className="dark:text-mountain-200 pointer-events-none w-full text-sm text-gray-800"
    >
      {item.name}
    </label>
  </div>
);

export const DataPopper: React.FC<DataPopperProps> = ({
  open,
  anchorEl,
  onClose,
  onSave,
  selectedData: selectedDataProp,
  data,
  renderItem,
  placement,
  className,
  selectionMode = 'multiple',
  showClearAllButton = false,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [internalSelectedData, setInternalSelectedData] = useState<
    string[] | string | null
  >(selectedDataProp);

  useEffect(() => {
    if (open) {
      setInternalSelectedData(selectedDataProp);
    }
  }, [selectedDataProp, open]);

  const handleDataClick = (name: string) => {
    if (selectionMode === 'single') {
      setInternalSelectedData(name);
    } else {
      setInternalSelectedData((prev) => {
        const currentArray = Array.isArray(prev) ? prev : [];
        return currentArray.includes(name)
          ? currentArray.filter((item) => item !== name)
          : [...currentArray, name];
      });
    }
  };

  const handleClearAll = () => {
    if (selectionMode === 'multiple') {
      setInternalSelectedData([]);
    }
  };

  const canClearAll =
    showClearAllButton &&
    selectionMode === 'multiple' &&
    Array.isArray(internalSelectedData) &&
    internalSelectedData.length > 0;

  return (
    <Popper
      sx={{ zIndex: 1200 }}
      open={open}
      anchorEl={anchorEl}
      placement={placement}
      transition
      className="mt-4 mr-4"
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Paper
            className={cn(
              'custom-scrollbar max-h-[60vh] w-72 overflow-y-auto rounded-lg',
              className,
            )}
          >
            <div className="dark:bg-mountain-950 dark:border-mountain-800 sticky top-0 w-full border-b bg-white p-4">
              <div className="bg-mountain-50 dark:bg-mountain-900 text-mountain-500 dark:text-mountain-400 relative flex h-10 items-center rounded-2xl">
                <FiSearch className="absolute left-2 h-5 w-5" />
                <Input
                  className="border-mountain-500 dark:border-mountain-700 text-mountain-800 dark:text-mountain-200 h-full w-full rounded-2xl border-1 bg-transparent pr-8 pl-8 shadow-inner"
                  placeholder="Search"
                  disableUnderline
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <TiDeleteOutline
                    className="hover:text-mountain-700 dark:hover:text-mountain-300 absolute right-2 h-5 w-5 cursor-pointer"
                    onClick={() => setSearchQuery('')}
                  />
                )}
              </div>
            </div>

            <div className="px-4">
              {data
                .filter((item) =>
                  item.name.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((item) => {
                  const renderer =
                    renderItem === 'category'
                      ? renderCategoryItemForPopper
                      : renderPropItemForPopper;

                  let isItemSelected: boolean;
                  if (selectionMode === 'single') {
                    isItemSelected = internalSelectedData === item.name;
                  } else {
                    isItemSelected =
                      Array.isArray(internalSelectedData) &&
                      internalSelectedData.includes(item.name);
                  }

                  return React.cloneElement(
                    renderer(item, isItemSelected, () =>
                      handleDataClick(item.name),
                    ),
                    { key: item.id },
                  );
                })}
            </div>

            <div className="dark:bg-mountain-950 dark:border-mountain-800 sticky bottom-0 flex items-center justify-between gap-2 border-t bg-white p-4">
              {/* Clear All Button - Conditionally Rendered on the left */}
              <div>
                {' '}
                {/* Wrapper to push Clear All to the left */}
                {canClearAll && (
                  <Button
                    variant="text"
                    color="error"
                    onClick={handleClearAll}
                    size="small"
                    className="normal-case"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {/* Action Buttons - Grouped on the right */}
              <div className="flex gap-2">
                <Button
                  variant="outlined"
                  onClick={() => {
                    onClose();
                  }}
                  className="normal-case"
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  disableElevation
                  onClick={() => {
                    onSave(internalSelectedData);
                    onClose();
                  }}
                  className="normal-case"
                >
                  Save
                </Button>
              </div>
            </div>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};
