import { Button } from '@mui/material';
import React, { useContext } from 'react';
import {
  ScrollMenu,
  VisibilityContext,
  type publicApiType,
} from 'react-horizontal-scrolling-menu';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import {
  FiChevronLeft as LeftArrowIcon,
  FiChevronRight as RightArrowIcon,
} from 'react-icons/fi';

const DefaultLeftArrow: React.FC = () => {
  const visibility = useContext<publicApiType>(VisibilityContext);
  const isFirstItemVisible = visibility.useIsVisible('first', true);

  return (
    <div className="react-horizontal-scrolling-menu--arrow-left z-50 mr-2 flex items-center justify-center">
      <Button
        variant="contained"
        color="primary"
        disableElevation
        disabled={isFirstItemVisible}
        aria-label="Scroll Left"
        className="aspect-[1/1] min-w-auto rounded-full p-1 shadow-md"
        onClick={() => visibility.scrollPrev()}
        size="small"
      >
        <LeftArrowIcon fontSize={20} />
      </Button>
    </div>
  );
};

const DefaultRightArrow: React.FC = () => {
  const visibility = useContext<publicApiType>(VisibilityContext);
  const isLastItemVisible = visibility.useIsVisible('last', false);

  return (
    <div className="react-horizontal-scrolling-menu--arrow-right z-50 ml-2 flex items-center justify-center">
      <Button
        variant="contained"
        color="primary"
        disableElevation
        disabled={isLastItemVisible}
        aria-label="Scroll Right"
        className="aspect-[1/1] min-w-auto rounded-full p-1 shadow-md"
        onClick={() => visibility.scrollNext()}
        size="small"
      >
        <RightArrowIcon fontSize={20} />
      </Button>
    </div>
  );
};

interface HorizontalSliderProps<T> {
  /** Array of data items to render in the slider. */
  data: T[];
  /** Function to render a single item. Receives the item and its index. */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Function to get a unique key/ID for each item. Crucial for the library. */
  getItemId: (item: T) => string | number;
  /** Optional CSS class name to apply to each item's wrapper div. Useful for spacing/layout. */
  itemClassName?: string;
  /** Optional custom component to use for the left arrow. */
  LeftArrowComponent?: React.FC;
  /** Optional custom component to use for the right arrow. */
  RightArrowComponent?: React.FC;
  /** Optional: Styling applied to the main ScrollMenu wrapper */
  wrapperClassName?: string;
  variant?: 'default' | 'overlay'; // new
}

const OverlayLeftArrow: React.FC = () => {
  const visibility = useContext<publicApiType>(VisibilityContext);
  const isFirstItemVisible = visibility.useIsVisible('first', true);
  if (isFirstItemVisible) return null;

  return (
    <>
      <div className="pointer-events-none absolute -left-4 z-10 flex h-full w-20 bg-gradient-to-r from-black/60 to-transparent opacity-0 transition duration-300 ease-in-out group-hover:opacity-100" />
      <div className="absolute top-1/2 left-2 z-20 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
        <DefaultLeftArrow />
      </div>
    </>
  );
};

const OverlayRightArrow: React.FC = () => {
  const visibility = useContext<publicApiType>(VisibilityContext);
  const isLastItemVisible = visibility.useIsVisible('last', false);
  if (isLastItemVisible) return null;
  return (
    <>
      <div className="pointer-events-none absolute -right-4 z-10 flex h-full w-20 bg-gradient-to-l from-black/60 to-transparent opacity-0 transition duration-300 ease-in-out group-hover:opacity-100" />
      <div className="absolute top-1/2 right-2 z-20 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
        <DefaultRightArrow />
      </div>
    </>
  );
};

export const HorizontalSlider = <T extends object>({
  data,
  renderItem,
  getItemId,
  itemClassName = 'flex-shrink-0 flex items-center mx-1',
  LeftArrowComponent = DefaultLeftArrow,
  RightArrowComponent = DefaultRightArrow,
  wrapperClassName = '',
  variant = 'default',
}: HorizontalSliderProps<T>) => {
  if (!data || data.length === 0) return null;

  const isOverlay = variant === 'overlay';

  return (
    <div
      className={`horizontal-slider-wrapper group relative overflow-x-hidden ${wrapperClassName}`}
    >
      <ScrollMenu
        LeftArrow={isOverlay ? OverlayLeftArrow : LeftArrowComponent}
        RightArrow={isOverlay ? OverlayRightArrow : RightArrowComponent}
        itemClassName={itemClassName}
      >
        {data.map((item, index) => {
          const itemId = getItemId(item);
          return (
            <div
              key={itemId}
              data-testid={`slider-item-${itemId}`}
              className="h-full"
            >
              {renderItem(item, index)}
            </div>
          );
        })}
      </ScrollMenu>
    </div>
  );
};
