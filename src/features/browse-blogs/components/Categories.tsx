import { categoriesData } from '@/utils/mocks';
import {
  Button,
  Fade,
  Input,
  Paper,
  Popper,
  PopperPlacementType,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import { FiSearch } from 'react-icons/fi';
import { TiDeleteOutline } from 'react-icons/ti';
import { HorizontalSlider } from '../../../components/sliders/HorizontalSlider';
import './Categories.css';

interface CategoriesProps {
  onSelectCategory: (categoryName: string) => void;
  selectedCategories: string[];
}

interface DataPopperProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSave: (selectedData: string[]) => void;
  selectedData: string[];
  data: { name: string; thumbnail?: string }[];
  renderItem: string;
  placement?: PopperPlacementType;
  className?: string;
}

export const Categories: React.FC<CategoriesProps> = ({
  onSelectCategory,
  selectedCategories,
}) => {
  const renderCategoryItem = (category: {
    name: string;
    thumbnail?: string;
  }) => {
    const isSelected = selectedCategories.includes(category.name);
    return (
      <div
        className={`category-item relative flex w-48 items-center justify-center ${isSelected ? 'bg-mountain-200 dark:bg-mountain-800' : 'hover:bg-mountain-100 dark:hover:bg-mountain-900'} cursor-pointer gap-2 rounded-lg border-indigo-400 p-1 ${isSelected ? 'border-indigo-500' : 'border-mountain-50'} border`}
        onClick={() => onSelectCategory(category.name)}
        title={category.name}
        style={{
          backgroundImage: category.thumbnail
            ? `url(${category.thumbnail})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay layer */}
        <div className="absolute inset-0 z-10 rounded-lg bg-black/50" />

        {/* Optional image element (can be removed if using backgroundImage only) */}
        {category.thumbnail && (
          <img
            src={category.thumbnail}
            alt={category.name}
            className="invisible h-12 w-48"
            loading="lazy"
          />
        )}

        {/* Category name */}
        <span className="text-mountain-50 dark:text-mountain-200 absolute z-20 line-clamp-2 px-2 text-center text-sm">
          {category.name}
        </span>
      </div>
    );
  };

  const getCategoryId = (category: { name: string; thumbnail?: string }) => {
    return category.name;
  };

  return (
    <HorizontalSlider
      data={categoriesData}
      renderItem={renderCategoryItem}
      getItemId={getCategoryId}
    />
  );
};

const renderCategoryItem = (
  item: { name: string; thumbnail?: string },
  isSelected: boolean,
  onClick: () => void,
) => (
  <div
    key={item.name}
    className={`flex cursor-pointer items-center ${
      isSelected ? 'bg-mountain-200' : 'hover:bg-mountain-100'
    } my-2 gap-1 rounded-lg p-2`}
    onClick={onClick}
  >
    {item.thumbnail && (
      <img
        src={item.thumbnail}
        alt={item.name}
        className="aspect-[1/1] w-12 rounded-lg object-cover object-center"
      />
    )}
    <span className="text-sm text-wrap text-gray-800">{item.name}</span>
  </div>
);

const renderPropItem = (
  item: { name: string; thumbnail?: string },
  isSelected: boolean,
  onClick: () => void,
) => (
  <div
    key={item.name}
    className="hover:bg-mountain-100 flex cursor-pointer items-center gap-2 rounded-lg p-2"
    onClick={onClick}
  >
    <input
      type="checkbox"
      id={item.name}
      checked={isSelected}
      className="pointer-events-none"
      readOnly
    />
    <label
      htmlFor={item.name}
      className="pointer-events-none w-full text-sm text-gray-800"
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
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedData, setSelectedData] = useState<string[]>(selectedDataProp);

  useEffect(() => {
    setSelectedData(selectedDataProp);
  }, [selectedDataProp]);

  const handleDataClick = (name: string) => {
    setSelectedData((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name],
    );
  };

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
              'custom-scrollbar max-h-[70vh] w-72 overflow-y-auto rounded-lg',
              className,
            )}
          >
            <div className="sticky top-0 w-full border-b bg-white p-4">
              <div className="bg-mountain-50 dark:bg-mountain-1000 text-mountain-500 relative flex h-10 items-center rounded-2xl">
                <FiSearch className="absolute left-2 h-5 w-5" />
                <Input
                  className="border-mountain-500 h-full w-full rounded-2xl border-1 pr-8 pl-8 shadow-inner"
                  placeholder="Search"
                  disableUnderline
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <TiDeleteOutline
                  className="absolute right-2 h-5 w-5 cursor-pointer"
                  onClick={() => setSearchQuery('')}
                />
              </div>
            </div>

            <div className="px-4">
              {data
                .filter((item) =>
                  item.name.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((item) =>
                  (renderItem === 'category'
                    ? renderCategoryItem
                    : renderPropItem)(
                    item,
                    selectedData.includes(item.name),
                    () => handleDataClick(item.name),
                  ),
                )}
            </div>

            <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-white p-4">
              <Button
                variant="outlined"
                onClick={() => {
                  onClose();
                  setSelectedData(selectedDataProp);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                disableElevation
                onClick={() => {
                  onSave(selectedData);
                  onClose();
                }}
              >
                Save
              </Button>
            </div>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};
