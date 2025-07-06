import {
  Categories,
  DataPopper,
} from "@/components/carousels/categories/Categories";
import { CategoryTypeValues } from "@/constants";
import { useCategories } from "@/hooks/useCategories";
import { Category } from "@/types";
import { Button } from "@mui/material";
import { UseQueryResult } from "@tanstack/react-query";
import { Ellipsis, LoaderPinwheel } from "lucide-react";
import { useMemo, useState } from "react";
import { BsFilter } from "react-icons/bs";

interface FilterBarProps {
  selectedCategories: string | null;
  setSelectedCategories: (category: string | null) => void;
  selectedMediums: string[];
  setSelectedMediums: (mediums: string[]) => void;
}

const FilterBar = ({
  selectedCategories,
  setSelectedCategories,
  selectedMediums,
  setSelectedMediums,
}: FilterBarProps) => {
  const [openCP, setOpenCP] = useState(false);
  const [openPP, setOpenPP] = useState(false);
  const [anchorElCP, setAnchorElCP] = useState<null | HTMLElement>(null);
  const [anchorElPP, setAnchorElPP] = useState<null | HTMLElement>(null);

  const {
    data: allCategories,
    isLoading: isLoadingAllCategories,
    isError: isErrorAllCategories,
  }: UseQueryResult<Category[]> = useCategories({ page: 1, pageSize: 200 });

  const attributeCategories = useMemo(() => {
    if (!allCategories) return [];
    return allCategories.filter(
      (cat) => cat.type === CategoryTypeValues.ATTRIBUTE,
    );
  }, [allCategories]);

  const mediumCategories = useMemo(() => {
    if (!allCategories) return [];
    return allCategories.filter(
      (cat) => cat.type === CategoryTypeValues.MEDIUM,
    );
  }, [allCategories]);

  const handleCategoriesChange = (categoryName: string | null) => {
    setSelectedCategories(categoryName);
  };

  const handleToggleCP = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElCP(event.currentTarget);
    setOpenCP((prevOpen) => !prevOpen);
  };

  const handleTogglePP = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElPP(event.currentTarget);
    setOpenPP((prevOpen) => !prevOpen);
  };

  const handleAllChannelsClick = () => {
    setSelectedCategories(null);

    if (openCP) setOpenCP(false);
  };

  const isAllChannelsSelected = selectedCategories === null;

  return (
    <div className="flex items-center gap-6 w-full overflow-x-hidden categories-bar">
      <Button
        className="flex flex-shrink-0 gap-2 dark:bg-mountain-900 shadow-none p-2 rounded-lg min-w-auto aspect-[1/1] font-normal dark:text-mountain-50 normal-case all-channels-btn"
        variant="contained"
        disableElevation
        onClick={handleToggleCP}
        disabled={isLoadingAllCategories}
      >
        {isLoadingAllCategories ? (
          <LoaderPinwheel size={16} className="animate-spin" />
        ) : (
          <Ellipsis />
        )}
      </Button>
      <DataPopper
        open={openCP}
        anchorEl={anchorElCP}
        onClose={() => setOpenCP(false)}
        onSave={(category) => setSelectedCategories(category as string | null)}
        selectedData={selectedCategories}
        data={attributeCategories}
        placement="bottom-start"
        renderItem="category"
        selectionMode="single"
      />

      <Button
        className={`all-channels-btn flex gap-2 flex-shrink-0 rounded-lg p-2 ${isAllChannelsSelected
          ? " dark:bg-mountain-800"
          : "dark:bg-mountain-900"
          }  dark:text-mountain-200 normal-case font-normal shadow-none`}
        variant={isAllChannelsSelected ? "contained" : "outlined"}
        onClick={handleAllChannelsClick}
        disableElevation={isAllChannelsSelected}
      >
        <div
          className={`p-2 rounded aspect-[1/1] ${isAllChannelsSelected
            ? "text-indigo-400 bg-mountain-50 dark:bg-mountain-700 dark:text-primary-400"
            : "text-mountain-900 bg-mountain-200 dark:bg-mountain-800 dark:text-mountain-300"
            } `}
        >
          <LoaderPinwheel size={16} />
        </div>
        <span className="flex-shrink-0">All Channels</span>
      </Button>
      <div className="flex-grow overflow-x-auto">
        <Categories
          onSelectCategory={handleCategoriesChange}
          selectedCategory={selectedCategories}
          data={attributeCategories}
          isLoading={isLoadingAllCategories}
          isError={isErrorAllCategories}
        />
      </div>
      <Button
        className="flex-shrink-0 dark:bg-mountain-900 p-2 rounded-lg min-w-auto aspect-[1/1] dark:text-mountain-50 spread-btn"
        variant="contained"
        disableElevation
        onClick={handleTogglePP}
        disabled={isLoadingAllCategories || mediumCategories.length === 0}
      >
        {isLoadingAllCategories ? (
          <LoaderPinwheel size={16} className="animate-spin" />
        ) : (
          <BsFilter size={24} />
        )}
      </Button>
      <DataPopper
        open={openPP}
        onClose={() => setOpenPP(false)}
        onSave={(mediums) => setSelectedMediums(mediums as string[])}
        anchorEl={anchorElPP}
        data={mediumCategories}
        selectedData={selectedMediums}
        placement="bottom-end"
        renderItem="prop"
        selectionMode="multiple"
        showClearAllButton={true}
      />
    </div>
  );
};

export default FilterBar;
