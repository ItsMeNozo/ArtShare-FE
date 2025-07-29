import { CategoryTypeValues } from '@/constants';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types';
import { Badge, Button } from '@mui/material';
import { UseQueryResult } from '@tanstack/react-query';
import { Ellipsis, LoaderPinwheel } from 'lucide-react';
import { useMemo } from 'react';
import { BsFilter } from 'react-icons/bs';
import AttributeFilters from './AttributeFilters';
import { AttributeSlider } from './AttributeSlider';
import MediumFilters from './MediumFilters';

interface FilterBarProps {
  selectedMediums: string[];
  setSelectedMediums: (attributes: string[]) => void;
  selectedAttribute: string | null;
  setSelectedAttribute: (medium: string | null) => void;
  isAi: boolean;
  setIsAi: (isAi: boolean) => void;
}

const FilterBar = ({
  selectedMediums,
  setSelectedMediums,
  selectedAttribute,
  setSelectedAttribute,
  isAi,
  setIsAi,
}: FilterBarProps) => {
  const {
    data: allCategories,
    isLoading: isLoadingAllCategories,
    isError: isErrorAllCategories,
  }: UseQueryResult<Category[]> = useCategories({});

  const attributeCategories = useMemo(() => {
    if (!allCategories) return [];
    return allCategories.filter(
      (cat) => cat.type === CategoryTypeValues.ATTRIBUTE,
    );
  }, [allCategories]);

  const handleAttributeChange = (mediumName: string | null) => {
    setSelectedAttribute(mediumName);
  };

  const handleAllAttributeClick = () => {
    setSelectedAttribute(null);
  };

  const isAllChannelsSelected = selectedAttribute === null;
  const selectedCount = selectedMediums.length;

  return (
    <div className="categories-bar flex w-full items-center gap-6">
      <AttributeFilters
        selectedAttribute={selectedAttribute}
        setSelectedAttribute={setSelectedAttribute}
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
      </AttributeFilters>

      <Button
        className={`all-channels-btn flex flex-shrink-0 gap-2 rounded-lg p-2 ${
          isAllChannelsSelected
            ? 'dark:bg-mountain-800'
            : 'dark:bg-mountain-900'
        } dark:text-mountain-200 font-normal normal-case shadow-none`}
        variant={isAllChannelsSelected ? 'contained' : 'outlined'}
        onClick={handleAllAttributeClick}
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
        <AttributeSlider
          onSelectCategory={handleAttributeChange}
          selectedCategory={selectedAttribute}
          data={attributeCategories}
          isLoading={isLoadingAllCategories}
          isError={isErrorAllCategories}
        />
      </div>

      <MediumFilters
        selectedMediums={selectedMediums}
        setSelectedMediums={setSelectedMediums}
        isAi={isAi}
        setIsAi={setIsAi}
      >
        {({ onClick, isLoading }) => (
          <Badge
            badgeContent={selectedCount}
            color="primary"
            overlap="circular"
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            invisible={selectedCount === 0}
          >
            <Button
              className="dark:bg-mountain-900 dark:text-mountain-50 spread-btn aspect-[1/1] min-w-auto flex-shrink-0 rounded-lg p-2"
              variant="contained"
              disableElevation
              onClick={onClick}
              disabled={isLoading}
            >
              <BsFilter size={24} />
            </Button>
          </Badge>
        )}
      </MediumFilters>
    </div>
  );
};

export default FilterBar;
