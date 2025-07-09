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
import React, { useState } from 'react';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import { FiSearch } from 'react-icons/fi';
import { TiDeleteOutline } from 'react-icons/ti';
import '../scrollbar.css';

interface MediumSelectorProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onClearData: () => void;
  onSelectMedium: (medium: string | null) => void;
  selectedMedium: string | null;
  data: Category[];
  placement?: PopperPlacementType;
  className?: string;
}

export const MediumSelector: React.FC<MediumSelectorProps> = ({
  open,
  anchorEl,
  onClose,
  onClearData,
  onSelectMedium,
  selectedMedium,
  data,
  placement,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleDataClick = (name: string) => {
    onClose();
    onSelectMedium(name);
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
              'custom-scrollbar max-h-[400px] w-72 overflow-y-auto rounded-lg',
              className,
            )}
          >
            <div className="dark:bg-mountain-950 dark:border-mountain-800 sticky top-0 w-full bg-white p-4 shadow-lg">
              <div className="bg-mountain-50 dark:bg-mountain-900 text-mountain-500 dark:text-mountain-400 relative flex h-10 items-center rounded-2xl">
                <FiSearch className="absolute left-2 h-5 w-5" />
                <Input
                  className="border-mountain-200 dark:border-mountain-700 text-mountain-800 dark:text-mountain-200 h-full w-full rounded-2xl border-1 bg-transparent pr-8 pl-8 text-sm shadow-inner"
                  placeholder="Search mediums..."
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
                  const renderer = renderCategoryItemForPopper;

                  const isItemSelected = selectedMedium === item.name;

                  return React.cloneElement(
                    renderer(item, isItemSelected, () =>
                      handleDataClick(item.name),
                    ),
                    { key: item.id },
                  );
                })}
            </div>

            <div className="dark:bg-mountain-950 dark:border-mountain-800 sticky bottom-0 flex items-center justify-between gap-2 bg-white p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
              <Button
                variant="text"
                color="error"
                onClick={() => onClearData()}
                size="small"
                className="normal-case"
                hidden={!selectedMedium}
              >
                Clear
              </Button>
            </div>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};

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
