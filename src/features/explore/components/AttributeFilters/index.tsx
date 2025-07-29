import { CategoryTypeValues } from '@/constants';
import { useCategories } from '@/hooks/useCategories';
import { Box, ClickAwayListener } from '@mui/material';
import { memo, useEffect, useState } from 'react';
import { AttributeSelector } from './AttributeSelector';

interface AttributeFiltersProps {
  selectedAttribute: string | null;
  setSelectedAttribute: (Attribute: string | null) => void;
  children: (triggerProps: {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    isLoading: boolean;
  }) => React.ReactElement;
  onOpenChange?: (isOpen: boolean) => void;
}

const AttributeFilters = ({
  selectedAttribute,
  setSelectedAttribute,
  children,
  onOpenChange,
}: AttributeFiltersProps) => {
  const [openCP, setOpenCP] = useState(false);
  const [anchorElCP, setAnchorElCP] = useState<null | HTMLElement>(null);
  const { data: AttributeCategories = [], isLoading } = useCategories({
    type: CategoryTypeValues.ATTRIBUTE,
  });

  useEffect(() => {
    onOpenChange?.(openCP);
  }, [openCP, onOpenChange]);

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElCP(event.currentTarget);
    setOpenCP((prevOpen) => !prevOpen);
  };

  const handleCloseAttributePopper = () => {
    setOpenCP(false);
    setAnchorElCP(null);
  };

  return (
    <ClickAwayListener onClickAway={handleCloseAttributePopper}>
      <Box>
        {children({
          onClick: handleToggle,
          isLoading: isLoading,
        })}
        <AttributeSelector
          open={openCP}
          anchorEl={anchorElCP}
          onClose={() => setOpenCP(false)}
          onClearData={() => {
            setOpenCP(false);
            setSelectedAttribute(null);
          }}
          onSelectAttribute={(Attribute) => setSelectedAttribute(Attribute)}
          selectedAttribute={selectedAttribute}
          data={AttributeCategories}
          placement="bottom-start"
        />
      </Box>
    </ClickAwayListener>
  );
};

export default memo(AttributeFilters);
