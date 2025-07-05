import { DataPopper } from '@/components/carousels/categories/Categories';
import { Button } from '@/components/ui/button';
import { CategoryTypeValues } from '@/constants';
import { useCategories } from '@/hooks/useCategories';
import { memo, useState } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { TbCategory } from 'react-icons/tb';

interface MediumFiltersProps {
  selectedMediums: string[];
  setSelectedMediums: React.Dispatch<React.SetStateAction<string[]>>;
}

const MediumFilters = ({
  selectedMediums,
  setSelectedMediums,
}: MediumFiltersProps) => {
  const [openCP, setOpenCP] = useState(false);
  const [anchorElCP, setAnchorElCP] = useState<null | HTMLElement>(null);

  const { data: mediumCategories = [] } = useCategories({
    type: CategoryTypeValues.MEDIUM,
  });

  const handleToggleCP = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElCP(event.currentTarget);
    setOpenCP((prevOpen) => !prevOpen);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="dark:bg-mountain-900 hover:bg-mountain-50 dark:hover:bg-mountain-800 border-mountain-200 dark:border-mountain-700 text-mountain-950 dark:text-mountain-200 flex w-auto cursor-pointer items-center justify-center rounded-full border bg-white px-3 py-1"
        onClick={handleToggleCP}
      >
        <TbCategory size={16} className="mr-1" />
        <p className="mr-1">Mediums</p>
        <IoMdArrowDropdown />
      </Button>
      <DataPopper
        open={openCP}
        anchorEl={anchorElCP}
        onClose={() => setOpenCP(false)}
        onSave={(categories) => {
          setSelectedMediums(categories as string[]);
        }}
        selectedData={selectedMediums}
        data={mediumCategories}
        placement="bottom-start"
        renderItem="category"
        selectionMode="multiple"
      />
    </div>
  );
};

export default memo(MediumFilters);
