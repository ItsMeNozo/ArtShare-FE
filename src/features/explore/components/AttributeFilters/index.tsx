import { CategoryTypeValues } from '@/constants';
import { useCategories } from '@/hooks/useCategories';
import { Box, ClickAwayListener } from '@mui/material';
import { memo, useState } from 'react';
import { AttributeSelector } from './AttributeSelector';

interface AttributeFiltersProps {
  selectedAttributes: string[];
  setSelectedAttributes: (attributes: string[]) => void;
  isAi: boolean;
  setIsAi: (isAi: boolean) => void;
  children: (triggerProps: {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    isLoading: boolean;
  }) => React.ReactElement;
}

const AttributeFilters = ({
  selectedAttributes,
  setSelectedAttributes,
  isAi,
  setIsAi,
  children,
}: AttributeFiltersProps) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { data: attributeCategories = [], isLoading } = useCategories({
    type: CategoryTypeValues.ATTRIBUTE,
  });

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box>
        {children({
          onClick: handleToggle,
          isLoading: isLoading,
        })}
        <AttributeSelector
          open={open}
          onClose={() => setOpen(false)}
          onSave={(attributes) => setSelectedAttributes(attributes)}
          anchorEl={anchorEl}
          data={attributeCategories}
          selectedData={selectedAttributes}
          placement="bottom-end"
          showClearAllButton={true}
          isAi={isAi}
          setIsAi={setIsAi}
        />
      </Box>
    </ClickAwayListener>
  );
};

export default memo(AttributeFilters);
