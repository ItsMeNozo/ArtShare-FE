import { CategoryTypeValues } from '@/constants';
import { useCategories } from '@/hooks/useCategories';
import { Badge, Box, ClickAwayListener } from '@mui/material';
import { memo, useState } from 'react';
import { MediumSelector } from './MediumSelector';

interface MediumFiltersProps {
  selectedMediums: string[];
  setSelectedMediums: (Mediums: string[]) => void;
  isAi: boolean;
  setIsAi: (isAi: boolean) => void;
  children: (triggerProps: {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    isLoading: boolean;
  }) => React.ReactElement;
}

const MediumFilters = ({
  selectedMediums,
  setSelectedMediums,
  isAi,
  setIsAi,
  children,
}: MediumFiltersProps) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { data: MediumCategories = [], isLoading } = useCategories({
    type: CategoryTypeValues.MEDIUM,
  });

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  const selectedCount = selectedMediums.length;

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box>
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
          {children({
            onClick: handleToggle,
            isLoading: isLoading,
          })}
        </Badge>
        <MediumSelector
          open={open}
          onClose={() => setOpen(false)}
          onSave={(Mediums) => setSelectedMediums(Mediums)}
          anchorEl={anchorEl}
          data={MediumCategories}
          selectedData={selectedMediums}
          placement="bottom-end"
          showClearAllButton={true}
          isAi={isAi}
          setIsAi={setIsAi}
        />
      </Box>
    </ClickAwayListener>
  );
};

export default memo(MediumFilters);
