import { Box, Button, Typography } from '@mui/material'; // MUI components for internal use if any
import React, { useCallback, useMemo, useState } from 'react';
import { MdAdd, MdClose } from 'react-icons/md';

// This is a type for Subject, which is a simplified version of Category to display on the UI.
export type Subject = {
  id: number;
  name: string;
  description?: string | null;
  examples?: string[];
};

interface SubjectSelectorProps {
  cate_ids: number[];
  setCateIds: (value: number[]) => void;
  currentSearchTerm: string; // Search term from SubjectPicker
  allSubjects: Subject[];
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  cate_ids,
  setCateIds,
  currentSearchTerm,
  allSubjects,
}) => {
  // Using cate_ids directly for selected state logic, no separate 'selected' state needed here for IDs.
  // 'selectedSubjects' can be derived for display if needed, or just use allSubjects and filter by cate_ids.
  const [hovered, setHovered] = useState<Subject | undefined>();

  const handleHover = useCallback(
    (s: Subject) => setHovered((prev) => (prev?.id === s.id ? prev : s)),
    [],
  );

  // --- Start: Logic mostly from your original SubjectSelector ---
  const isSelected = useCallback(
    (subject: Subject) => cate_ids.includes(subject.id), // Check against cate_ids prop
    [cate_ids],
  );

  const toggleSubject = useCallback(
    (subjectToToggle: Subject) => {
      const currentIds = new Set(cate_ids);
      if (currentIds.has(subjectToToggle.id)) {
        currentIds.delete(subjectToToggle.id);
      } else {
        if (currentIds.size < 3) {
          currentIds.add(subjectToToggle.id);
        } else {
          console.warn('Max 3 categories');
          return;
        }
      }
      setCateIds(Array.from(currentIds));
      // The search input is now in SubjectPicker, so no setSearch("") here.
    },
    [cate_ids, setCateIds],
  );

  const SubjectRow = React.memo(
    ({
      subject,
      toggle,
      handleHover,
    }: {
      subject: Subject;
      toggle: (s: Subject) => void;
      handleHover: (s: Subject) => void;
    }) => {
      const subjectIsSelected = isSelected(subject); // Use the main isSelected function
      const isDisabled = cate_ids.length >= 3 && !subjectIsSelected;

      return (
        <li
          className="dark:hover:bg-mountain-800 flex cursor-pointer items-center justify-between gap-2 rounded px-2 py-2 text-sm hover:bg-gray-100"
          onMouseEnter={() => handleHover(subject)}
        >
          {/* Changed from flex-1 to max-w-[60%] or similar if that was your original intent for space */}
          <span className="flex-1 truncate pr-2">{subject.name}</span>{' '}
          {/* Using flex-1 as it's common */}
          <Button
            onClick={() => toggle(subject)}
            className={`${
              // YOUR ORIGINAL CONDITIONAL CLASSES FOR THE BUTTON
              isDisabled
                ? 'dark:text-mountain-500 text-gray-400' // Disabled state
                : 'text-black dark:text-white' // Enabled state
            } dark:bg-mountain-950 dark:hover:bg-mountain-900 flex min-w-[110px] items-center justify-center gap-1 rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-100 dark:border-gray-600`}
            disabled={isDisabled}
          >
            {!subjectIsSelected ? (
              <>
                <MdAdd size={16} className="text-indigo-500" />
                <span className="text-sm">Add</span>
              </>
            ) : (
              <>
                <MdClose size={16} className="text-red-400" />
                <span className="text-sm">Remove</span>
              </>
            )}
          </Button>
        </li>
      );
    },
  );
  SubjectRow.displayName = 'SubjectRowFromSelector';

  const filteredSubjects = useMemo(() => {
    const searchTerm = currentSearchTerm.toLowerCase();
    if (!searchTerm) return allSubjects;
    return allSubjects.filter((s) => s.name.toLowerCase().includes(searchTerm));
  }, [allSubjects, currentSearchTerm]);

  const remainingSlots = 3 - cate_ids.length;

  return (
    <Box
      className="dark:bg-mountain-900 flex h-[40vh] w-[820px] flex-col rounded-lg bg-white p-3 text-black dark:text-white"
      style={{ scrollbarGutter: 'stable' }} /* reserve scroll‑bar width */
    >
      <Box className="flex flex-grow flex-row gap-4 overflow-hidden">
        {/* Left column: List of subjects */}
        <Box className="w-2/5 overflow-y-auto pr-2">
          <Typography className="mb-3 py-1.5 text-sm text-gray-700 dark:text-gray-400">
            CHOOSE ANOTHER {remainingSlots} ART TYPE
            {remainingSlots !== 1 ? 'S' : ''}
          </Typography>
          {allSubjects.length === 0 && !currentSearchTerm ? (
            <p className="py-4 text-center text-sm text-gray-500 italic dark:text-gray-400">
              Loading art types...
            </p>
          ) : filteredSubjects.length > 0 ? (
            <ul
              className="custom-scroll flex-1 space-y-2 overflow-y-auto pr-1"
              style={{ scrollbarGutter: 'stable' }}
            >
              {filteredSubjects.map((subject) => (
                <SubjectRow
                  key={subject.id}
                  subject={subject}
                  // isSelected is handled inside SubjectRow now or pass isSelected(subject)
                  toggle={toggleSubject} // Use the main toggleSubject
                  handleHover={handleHover}
                />
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm text-gray-500 italic dark:text-gray-400">
              No art types match "{currentSearchTerm}".
            </p>
          )}
        </Box>
        {/* Right preview panel */}
        <Box className="flex flex-1 flex-col overflow-hidden border-l border-gray-300 dark:border-gray-700">
          {allSubjects.map((category) => (
            <CategoryPreviewer
              category={category}
              hidden={category.name != hovered?.name}
            />
          ))}
          {!hovered && (
            <div className="dark:bg-mountain-900 flex h-full items-center justify-center rounded-md bg-gray-50">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {allSubjects.length > 0
                  ? 'Select or hover an art type.'
                  : 'Loading details...'}
              </p>
            </div>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SubjectSelector;

interface CategoryPreviewerProps {
  category: Subject;
  hidden?: boolean;
}

const CategoryPreviewer = React.memo(
  ({ category, hidden }: CategoryPreviewerProps) => {
    const { name, description = '', examples = [] } = category;
    return (
      <Box
        className="custom-scroll h-[357px] flex-col overflow-y-auto rounded-md p-3 md:p-4"
        display={hidden ? 'none' : 'flex'}
      >
        <Box className="mb-3">
          <h3 className="text-lg font-semibold md:text-xl">{name}</h3>
          <p className="text-xs break-words text-gray-600 md:text-sm dark:text-gray-300">
            {description}
          </p>
        </Box>
        <Box>
          <Typography className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            Examples
          </Typography>
          {examples.length > 0 ? (
            <div className="custom-scroll-x flex max-w-full gap-2 overflow-x-auto pb-1 md:gap-3">
              {examples.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Example ${idx + 1} for ${name}`}
                  className="h-28 w-28 flex-shrink-0 rounded object-cover md:h-32 md:w-32"
                  loading="lazy"
                />
              ))}
            </div>
          ) : (
            <Typography className="text-xs text-gray-500 italic md:text-sm dark:text-gray-400">
              No examples available for this art type.
            </Typography>
          )}
        </Box>
      </Box>
    );
  },
);
