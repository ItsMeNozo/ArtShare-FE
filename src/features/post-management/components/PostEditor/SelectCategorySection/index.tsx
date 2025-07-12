import AsyncWrapper from '@/components/AsyncWrapper';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types';
import {
  Box,
  Button,
  ClickAwayListener,
  Paper,
  Popper,
  TextField,
  Typography,
  useTheme, // <-- add useTheme
} from '@mui/material';
import { UseQueryResult } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MdClose } from 'react-icons/md';
import type { Subject as SubjectType } from './SubjectSelector';
import SubjectSelector from './SubjectSelector';

interface SelectCategorySectionProps {
  categoryIds: number[];
  setCategoryIds: (ids: number[]) => void;
}

export default function SelectCategorySection({
  categoryIds,
  setCategoryIds,
}: SelectCategorySectionProps) {
  const theme = useTheme(); // 🟢 useTheme hook

  // derive border colors from your MUI theme
  // workaround: access custom 'mountain' palette safely

  const defaultBorder = theme.palette.divider;
  const hoverBorder = '#9ca3af';
  const focusBorder = '#a5b4fc'; // always use light theme primary.main for focus

  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [allSubjectsForDisplay, setAllSubjectsForDisplay] = useState<
    SubjectType[]
  >([]);

  const {
    data: fetchedCategories,
    isLoading,
    isError,
  }: UseQueryResult<Category[]> = useCategories({});

  useEffect(() => {
    if (!fetchedCategories) return;

    const subjects: SubjectType[] = fetchedCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      examples: cat.exampleImages,
    }));

    setAllSubjectsForDisplay(subjects);
  }, [fetchedCategories]);

  const selectedSubjectObjects = useMemo(
    () =>
      allSubjectsForDisplay.filter((subject) =>
        categoryIds.includes(subject.id),
      ),
    [categoryIds, allSubjectsForDisplay],
  );

  const handleClickAway = () => setOpen(false);
  const handleMainInputFocus = () => setOpen(true);
  const handleCateIdsChange = (ids: number[]) => setCategoryIds(ids);
  const toggleSubjectInPicker = (subject: SubjectType) => {
    const idsSet = new Set(categoryIds);
    if (idsSet.has(subject.id)) idsSet.delete(subject.id);
    else if (idsSet.size < 3) idsSet.add(subject.id);
    setCategoryIds(Array.from(idsSet));
  };

  return (
    <AsyncWrapper loading={isLoading} error={isError}>
      <Box sx={{ position: 'relative', width: '100%' }} ref={anchorRef}>
        <Typography className="dark:text-mountain-200 mb-1 text-sm text-gray-800">
          How would you categorize this work? (Choose up to 3)
        </Typography>

        <Box
          onClick={handleMainInputFocus}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            minHeight: '52px',
            border: '2px solid',
            borderColor: open ? focusBorder : defaultBorder,
            borderRadius: '6px',
            backgroundColor: theme.palette.background.paper,
            padding: selectedSubjectObjects.length ? '4px 8px' : '',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!open) e.currentTarget.style.borderColor = hoverBorder;
          }}
          onMouseLeave={(e) => {
            if (!open) e.currentTarget.style.borderColor = defaultBorder;
          }}
        >
          {selectedSubjectObjects.map((subject) => (
            <Box
              key={subject.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                backgroundColor: theme.palette.action.hover,
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              <Box component="span">{subject.name}</Box>
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSubjectInPicker(subject);
                }}
                sx={{ minWidth: 0, p: 0.25 }}
              >
                <MdClose size={16} />
              </Button>
            </Box>
          ))}

          <TextField
            variant="standard"
            fullWidth={!selectedSubjectObjects.length}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!open) setOpen(true);
            }}
            placeholder={
              selectedSubjectObjects.length < 3
                ? 'Choose art type or search...'
                : 'Maximum 3 selected'
            }
            disabled={selectedSubjectObjects.length >= 3 && !search}
            onFocus={handleMainInputFocus}
            slotProps={{
              input: {
                readOnly: categoryIds.length >= 3,
                disableUnderline: true,
              },
            }}
            sx={{
              flexGrow: 1,
              minWidth: selectedSubjectObjects.length ? '150px' : '100%',
              input: {
                px: selectedSubjectObjects.length ? 1 : 2,
                py: selectedSubjectObjects.length ? 0.5 : 2,
                fontSize: '0.875rem',
              },
            }}
          />
        </Box>

        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          style={{ zIndex: 1300, width: 820 }}
        >
          <ClickAwayListener
            onClickAway={handleClickAway}
            mouseEvent="onMouseDown"
            touchEvent="onTouchStart"
          >
            <Paper
              elevation={4}
              sx={{ borderRadius: 2, overflow: 'hidden', width: '100%' }}
            >
              <SubjectSelector
                categoryIds={categoryIds}
                setCategoryIds={handleCateIdsChange}
                currentSearchTerm={search}
                allSubjects={allSubjectsForDisplay}
              />
            </Paper>
          </ClickAwayListener>
        </Popper>
      </Box>
    </AsyncWrapper>
  );
}
