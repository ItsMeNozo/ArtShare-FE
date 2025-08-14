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

interface AttributeSelectorProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onClearData: () => void;
  onSelectAttribute: (Attribute: string | null) => void;
  selectedAttribute: string | null;
  data: Category[];
  placement?: PopperPlacementType;
  className?: string;
}

export const AttributeSelector: React.FC<AttributeSelectorProps> = ({
  open,
  anchorEl,
  onClose,
  onClearData,
  onSelectAttribute,
  selectedAttribute,
  data,
  placement,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleDataClick = (name: string) => {
    onClose();
    onSelectAttribute(name);
  };

  return (
    <Popper
      sx={{ zIndex: 1200 }}
      open={open}
      anchorEl={anchorEl}
      placement={placement}
      transition
      className="mt-4 mr-4"
      modifiers={[
        {
          name: 'flip',
          enabled: true,
          options: {
            altBoundary: true,
            rootBoundary: 'viewport',
            padding: 8,
          },
        },
        {
          name: 'preventOverflow',
          enabled: true,
          options: {
            altAxis: true,
            altBoundary: true,
            tether: true,
            rootBoundary: 'viewport',
            padding: 8,
          },
        },
      ]}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Paper
            className={cn('w-72 rounded-lg', className)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'min(300px, 40vh)',
              height: 'auto',
            }}
          >
            <div className="dark:bg-mountain-950 dark:border-mountain-800 dark:border-mountain-700 w-full flex-shrink-0 border-b border-gray-200 bg-white p-4 shadow-lg">
              <div className="bg-mountain-50 dark:bg-mountain-900 text-mountain-500 dark:text-mountain-400 relative flex h-10 items-center rounded-2xl">
                <FiSearch className="absolute left-2 h-5 w-5" />
                <Input
                  className="border-mountain-200 dark:border-mountain-700 text-mountain-800 dark:text-mountain-200 h-full w-full rounded-2xl border-1 bg-transparent pr-8 pl-8 text-sm shadow-inner"
                  placeholder="Search Attributes..."
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

            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-4">
              {data
                .filter((item) =>
                  item.name.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((item) => {
                  const renderer = renderCategoryItemForPopper;

                  const isItemSelected = selectedAttribute === item.name;

                  return React.cloneElement(
                    renderer(item, isItemSelected, () =>
                      handleDataClick(item.name),
                    ),
                    { key: item.id },
                  );
                })}
            </div>

            <div className="dark:bg-mountain-950 dark:border-mountain-800 dark:border-mountain-700 flex flex-shrink-0 items-center justify-between gap-2 border-t border-gray-200 bg-white p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
              <Button
                variant="text"
                color="error"
                onClick={() => onClearData()}
                size="small"
                className="normal-case"
                hidden={!selectedAttribute}
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
    item.exampleImages && item.exampleImages.length > 0
      ? item.exampleImages[0]
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
