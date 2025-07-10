import { CategoryTypeValues } from '@/constants';
import { useCategories } from '@/hooks/useCategories';
import { Box, ClickAwayListener } from '@mui/material';
import { memo, useState } from 'react';
import { MediumSelector } from './MediumSelector';

interface MediumFiltersProps {
  selectedMedium: string | null;
  setSelectedMedium: (medium: string | null) => void;
  children: (triggerProps: {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    isLoading: boolean;
  }) => React.ReactElement;
}

const MediumFilters = ({
  selectedMedium,
  setSelectedMedium,
  children,
}: MediumFiltersProps) => {
  const [openCP, setOpenCP] = useState(false);
  const [anchorElCP, setAnchorElCP] = useState<null | HTMLElement>(null);
  const { data: mediumCategories = [], isLoading } = useCategories({
    type: CategoryTypeValues.MEDIUM,
  });
  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElCP(event.currentTarget);
    setOpenCP((prevOpen) => !prevOpen);
  };
  const handleCloseMediumPopper = () => {
    setOpenCP(false);
    setAnchorElCP(null);
  };
  return (
    <ClickAwayListener onClickAway={handleCloseMediumPopper}>
      <Box>
        {children({
          onClick: handleToggle,
          isLoading: isLoading,
        })}
        <MediumSelector
          open={openCP}
          anchorEl={anchorElCP}
          onClose={() => setOpenCP(false)}
          onClearData={() => {
            setOpenCP(false);
            setSelectedMedium(null);
          }}
          onSelectMedium={(medium) => setSelectedMedium(medium)}
          selectedMedium={selectedMedium}
          data={mediumCategories}
          placement="bottom-start"
        />
      </Box>
    </ClickAwayListener>
  );
};

export default memo(MediumFilters);
