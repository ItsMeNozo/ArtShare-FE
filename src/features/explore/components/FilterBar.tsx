import { CategoryTypeValues } from '@/constants';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types';
import { Button } from '@mui/material';
import { UseQueryResult } from '@tanstack/react-query';
import { Ellipsis, LoaderPinwheel } from 'lucide-react';
import { useMemo } from 'react';
import { BsFilter } from 'react-icons/bs';
import AttributeFilters from './AttributeFilters';
import MediumFilters from './MediumFilters';
import { MediumSlider } from './MediumSlider';

interface FilterBarProps {
  selectedAttributes: string[];
  setSelectedAttributes: (attributes: string[]) => void;
  selectedMedium: string | null;
  setSelectedMedium: (medium: string | null) => void;
  isAi: boolean;
  setIsAi: (isAi: boolean) => void;
}

const FilterBar = ({
  selectedAttributes,
  setSelectedAttributes,
  selectedMedium,
  setSelectedMedium,
  isAi,
  setIsAi,
}: FilterBarProps) => {
  const {
    data: allCategories,
    isLoading: isLoadingAllCategories,
    isError: isErrorAllCategories,
  }: UseQueryResult<Category[]> = useCategories({});

  const mediumCategories = useMemo(() => {
    if (!allCategories) return [];
    return allCategories.filter(
      (cat) => cat.type === CategoryTypeValues.MEDIUM,
    );
  }, [allCategories]);

  const handleMediumChange = (mediumName: string | null) => {
    setSelectedMedium(mediumName);
  };

  const handleAllMediumsClick = () => {
    setSelectedMedium(null);
  };

  const isAllChannelsSelected = selectedMedium === null;

  return (
    <div className="categories-bar flex w-full items-center gap-6 overflow-x-hidden">
      <MediumFilters
        selectedMedium={selectedMedium}
        setSelectedMedium={setSelectedMedium}
      >
        {({ onClick, isLoading }) => (
          <Button
            className="dark:bg-mountain-900 dark:text-mountain-50 all-channels-btn flex aspect-[1/1] min-w-auto flex-shrink-0 gap-2 rounded-lg p-2 font-normal normal-case shadow-none"
            variant="contained"
            disableElevation
            onClick={onClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <LoaderPinwheel size={16} className="animate-spin" />
            ) : (
              <Ellipsis />
            )}
          </Button>
        )}
      </MediumFilters>

      <Button
        className={`all-channels-btn flex flex-shrink-0 gap-2 rounded-lg p-2 ${
          isAllChannelsSelected
            ? 'dark:bg-mountain-800'
            : 'dark:bg-mountain-900'
        } dark:text-mountain-200 font-normal normal-case shadow-none`}
        variant={isAllChannelsSelected ? 'contained' : 'outlined'}
        onClick={handleAllMediumsClick}
        disableElevation={isAllChannelsSelected}
      >
        <div
          className={`aspect-[1/1] rounded p-2 ${
            isAllChannelsSelected
              ? 'bg-mountain-50 dark:bg-mountain-700 dark:text-primary-400 text-indigo-400'
              : 'text-mountain-900 bg-mountain-200 dark:bg-mountain-800 dark:text-mountain-300'
          } `}
        >
          <LoaderPinwheel size={16} />
        </div>
        <span className="flex-shrink-0">All Channels</span>
      </Button>
      <div className="flex-grow overflow-x-auto">
        <MediumSlider
          onSelectCategory={handleMediumChange}
          selectedCategory={selectedMedium}
          data={mediumCategories}
          isLoading={isLoadingAllCategories}
          isError={isErrorAllCategories}
        />
      </div>

      <AttributeFilters
        selectedAttributes={selectedAttributes}
        setSelectedAttributes={setSelectedAttributes}
        isAi={isAi}
        setIsAi={setIsAi}
      >
        {({ onClick, isLoading }) => (
          <Button
            className="dark:bg-mountain-900 dark:text-mountain-50 spread-btn aspect-[1/1] min-w-auto flex-shrink-0 rounded-lg p-2"
            variant="contained"
            disableElevation
            onClick={onClick}
            disabled={isLoading}
          >
            <BsFilter size={24} />
          </Button>
        )}
      </AttributeFilters>
    </div>
  );
};

export default FilterBar;
