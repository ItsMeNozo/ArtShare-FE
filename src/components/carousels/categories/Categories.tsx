import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { cn } from "@/lib/utils";
import { Category } from "@/types";
import {
  Button,
  Fade,
  Input,
  Paper,
  Popper,
  PopperPlacementType,
} from "@mui/material";
import { LoaderPinwheel } from "lucide-react";
import React, { useEffect, useState } from "react";
import "react-horizontal-scrolling-menu/dist/styles.css";
import { FiSearch } from "react-icons/fi";
import { TiDeleteOutline } from "react-icons/ti";
import { HorizontalSlider } from "../../sliders/HorizontalSlider";
import "./Categories.css";

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
        className={`category-item max-w-48 flex justify-center items-center ${
          isSelected
            ? "bg-mountain-200 dark:bg-mountain-800"
            : "hover:bg-mountain-100 dark:hover:bg-mountain-900"
        } cursor-pointer rounded-lg p-2 gap-2 border ${
          isSelected ? "border-primary-500" : "border-transparent"
        }`}
        onClick={() => onSelectCategory(category.name)}
        title={category.name}
      >
        <ImageWithFallback
          src={imageUrl}
          alt={category.name}
          className="border dark:border-mountain-700 rounded-lg w-10 h-10 object-center object-cover aspect-[1/1]"
        />
        <span className="text-sm text-mountain-800 dark:text-mountain-200 line-clamp-2">
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
      <div className="flex-grow flex items-center justify-center p-4 min-h-[76px]">
        <LoaderPinwheel className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-grow flex items-center justify-center p-4 min-h-[76px] text-red-500 text-center">
        Failed to load attributes.
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center p-4 min-h-[76px] text-center text-gray-500">
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
  renderItem: "category" | "prop";
  placement?: PopperPlacementType;
  className?: string;
  selectionMode?: "single" | "multiple";
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
      className={`flex items-center cursor-pointer ${
        isSelected
          ? "bg-mountain-200 dark:bg-mountain-800"
          : "hover:bg-mountain-100 dark:hover:bg-mountain-900"
      } rounded-lg p-2 gap-2 my-2`}
      onClick={onClick}
    >
      <ImageWithFallback
        src={imageUrl}
        alt={item.name}
        className="rounded-lg w-12 h-12 object-center object-cover aspect-[1/1]"
      />
      <span className="text-sm text-gray-800 dark:text-mountain-200 text-wrap">
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
    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-mountain-100 dark:hover:bg-mountain-900"
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
      className="w-full text-sm text-gray-800 pointer-events-none dark:text-mountain-200"
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
  selectionMode = "multiple",
  showClearAllButton = false,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [internalSelectedData, setInternalSelectedData] = useState<
    string[] | string | null
  >(selectedDataProp);

  useEffect(() => {
    if (open) {
      setInternalSelectedData(selectedDataProp);
    }
  }, [selectedDataProp, open]);

  const handleDataClick = (name: string) => {
    if (selectionMode === "single") {
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
    if (selectionMode === "multiple") {
      setInternalSelectedData([]);
    }
  };

  const canClearAll =
    showClearAllButton &&
    selectionMode === "multiple" &&
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
              "rounded-lg w-72 max-h-[60vh] overflow-y-auto custom-scrollbar",
              className,
            )}
          >
            <div className="sticky top-0 w-full p-4 bg-white border-b dark:bg-mountain-950 dark:border-mountain-800">
              <div className="relative flex items-center h-10 bg-mountain-50 dark:bg-mountain-900 rounded-2xl text-mountain-500 dark:text-mountain-400">
                <FiSearch className="absolute w-5 h-5 left-2" />
                <Input
                  className="w-full h-full pl-8 pr-8 bg-transparent shadow-inner border-1 border-mountain-500 dark:border-mountain-700 rounded-2xl text-mountain-800 dark:text-mountain-200"
                  placeholder="Search"
                  disableUnderline
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <TiDeleteOutline
                    className="absolute w-5 h-5 cursor-pointer right-2 hover:text-mountain-700 dark:hover:text-mountain-300"
                    onClick={() => setSearchQuery("")}
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
                    renderItem === "category"
                      ? renderCategoryItemForPopper
                      : renderPropItemForPopper;

                  let isItemSelected: boolean;
                  if (selectionMode === "single") {
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

            <div className="sticky bottom-0 flex items-center justify-between gap-2 p-4 bg-white border-t dark:bg-mountain-950 dark:border-mountain-800">
              {/* Clear All Button - Conditionally Rendered on the left */}
              <div>
                {" "}
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
