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
import React, { useEffect, useState } from 'react';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import { FiSearch } from 'react-icons/fi';
import { TiDeleteOutline } from 'react-icons/ti';
import '../scrollbar.css';

interface MediumSelectorProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSave: (selectedData: string[]) => void;
  selectedData: string[];
  data: Category[];
  placement?: PopperPlacementType;
  className?: string;
  showClearAllButton?: boolean;
  isAi: boolean;
  setIsAi: (isAi: boolean) => void;
}

export const MediumSelector: React.FC<MediumSelectorProps> = ({
  open,
  anchorEl,
  onClose,
  onSave,
  selectedData: selectedDataProp,
  data,
  placement,
  className,
  showClearAllButton = false,
  isAi,
  setIsAi,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [internalSelectedData, setInternalSelectedData] =
    useState<string[]>(selectedDataProp);
  const [internalIsAi, setInternalIsAi] = useState(isAi);

  useEffect(() => {
    if (open) {
      setInternalSelectedData(selectedDataProp);
    }
  }, [selectedDataProp, open]);

  const handleDataClick = (name: string) => {
    setInternalSelectedData((prev) => {
      const currentArray = Array.isArray(prev) ? prev : [];
      return currentArray.includes(name)
        ? currentArray.filter((item) => item !== name)
        : [...currentArray, name];
    });
  };

  const handleClearAll = () => {
    setInternalSelectedData([]);
    setInternalIsAi(false);
  };

  const canClearAll =
    showClearAllButton && (internalSelectedData.length > 0 || internalIsAi);

  return (
    <Popper
      sx={{ zIndex: 1200 }}
      open={open}
      anchorEl={anchorEl}
      placement={placement}
      transition
      className="mt-4"
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
                  placeholder="Search Mediums..."
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
              {renderPropItemForPopper(
                {
                  id: 99,
                  name: 'Created by Artnova',
                },
                internalIsAi,
                () => setInternalIsAi(!internalIsAi),
              )}

              {/* a separator line */}
              <div className="dark:bg-mountain-700 h-px bg-gray-300" />

              {data
                .filter((item) =>
                  item.name.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((item) => {
                  const isItemSelected =
                    Array.isArray(internalSelectedData) &&
                    internalSelectedData.includes(item.name);

                  return React.cloneElement(
                    renderPropItemForPopper(item, isItemSelected, () =>
                      handleDataClick(item.name),
                    ),
                    { key: item.id },
                  );
                })}
            </div>

            <div className="dark:bg-mountain-950 dark:border-mountain-800 dark:border-mountain-700 flex flex-shrink-0 items-center justify-between gap-2 border-t border-gray-200 bg-white p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
              {/* Clear All Button - Conditionally Rendered on the left */}
              <div>
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
                    setIsAi(internalIsAi);
                    onClose();
                  }}
                  className="normal-case"
                >
                  Apply
                </Button>
              </div>
            </div>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};

const renderPropItemForPopper = (
  item: { id: number; name: string },
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
