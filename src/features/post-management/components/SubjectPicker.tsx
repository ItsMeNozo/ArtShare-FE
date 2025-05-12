import { useMemo, useRef, useState, useEffect } from "react";
import {
  TextField,
  Popper,
  Paper,
  ClickAwayListener,
  Box,
  Button,
  useTheme, // <-- add useTheme
} from "@mui/material";
import { MdClose } from "react-icons/md";
import SubjectSelector from "./SubjectSelector";
import type { Subject as SubjectType } from "./SubjectSelector";
import { getCategories } from "@/api/category";

interface SubjectPickerProps {
  cate_ids: number[];
  setCateIds: (ids: number[]) => void;
}

export default function SubjectPicker({
  cate_ids,
  setCateIds,
}: SubjectPickerProps) {
  const theme = useTheme(); // 🟢 useTheme hook

  // derive border colors from your MUI theme
  // workaround: access custom 'mountain' palette safely

  const defaultBorder = theme.palette.divider;
  const hoverBorder = "#9ca3af";
  const focusBorder = "#a5b4fc"; // always use light theme primary.main for focus

  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [allSubjectsForDisplay, setAllSubjectsForDisplay] = useState<
    SubjectType[]
  >([]);

  useEffect(() => {
    getCategories().then((apiCategories) => {
      const subjects: SubjectType[] = apiCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        examples: cat.example_images,
      }));
      setAllSubjectsForDisplay(subjects);
    });
  }, []);

  const selectedSubjectObjects = useMemo(
    () =>
      allSubjectsForDisplay.filter((subject) => cate_ids.includes(subject.id)),
    [cate_ids, allSubjectsForDisplay],
  );

  const handleClickAway = () => setOpen(false);
  const handleMainInputFocus = () => setOpen(true);
  const handleCateIdsChange = (ids: number[]) => setCateIds(ids);
  const toggleSubjectInPicker = (subject: SubjectType) => {
    const idsSet = new Set(cate_ids);
    if (idsSet.has(subject.id)) idsSet.delete(subject.id);
    else if (idsSet.size < 3) idsSet.add(subject.id);
    setCateIds(Array.from(idsSet));
  };

  return (
    <Box sx={{ position: "relative", width: "100%" }} ref={anchorRef}>
      <p className="mb-1 text-sm text-gray-800 dark:text-mountain-200">
        How would you categorize this work? (Choose up to 3)
      </p>

      {/* wrapper styled like MUI InputBase-root */}
      <div
        onClick={handleMainInputFocus}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
          minHeight: "52px",
          border: "2px solid",
          borderColor: open ? focusBorder : defaultBorder,
          borderRadius: "6px",
          backgroundColor: theme.palette.background.paper,
          padding: selectedSubjectObjects.length ? "4px 8px" : "",
          transition: "border-color 0.2s",
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
              display: "flex",
              alignItems: "center",
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
              ? "Choose art type or search..."
              : "Maximum 3 selected"
          }
          disabled={selectedSubjectObjects.length >= 3 && !search}
          onFocus={handleMainInputFocus}
          slotProps={{
            input: { readOnly: cate_ids.length >= 3, disableUnderline: true },
          }}
          sx={{
            flexGrow: 1,
            minWidth: selectedSubjectObjects.length ? "150px" : "100%",
            input: {
              px: selectedSubjectObjects.length ? 1 : 2,
              py: selectedSubjectObjects.length ? 0.5 : 2,
              fontSize: "0.875rem",
            },
          }}
        />
      </div>

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
            sx={{ borderRadius: 2, overflow: "hidden", width: "100%" }}
          >
            <SubjectSelector
              cate_ids={cate_ids}
              setCateIds={handleCateIdsChange}
              currentSearchTerm={search}
            />
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
}
