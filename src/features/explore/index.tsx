import { Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import React, { memo, useState } from 'react';
import 'react-photo-album/rows.css';
import { ExploreGallery } from './components/ExploreGallery';
import FilterBar from './components/FilterBar';
import { ExploreTab } from './types';

const Explore: React.FC = () => {
  const [tab, setTab] = useState<ExploreTab>('Trending');
  const [selectedMedium, setSelectedMedium] = useState<string | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [isAi, setIsAi] = useState(false);
  const token = localStorage.getItem('accessToken');

  const handleTabChange = (
    _: React.MouseEvent<HTMLElement>,
    newTab: ExploreTab,
  ) => {
    if (newTab) setTab(newTab);
  };

  return (
    <div className="relative flex h-screen min-h-0 flex-col">
      <div className="dark:from-mountain-1000 to-mountain-50 dark:to-mountain-950 sticky z-10 flex flex-col gap-4 rounded-t-3xl bg-gradient-to-t from-white px-4 py-1 pt-3 dark:bg-gradient-to-t">
        <FilterBar
          selectedMedium={selectedMedium}
          setSelectedMedium={setSelectedMedium}
          selectedAttributes={selectedAttributes}
          setSelectedAttributes={setSelectedAttributes}
          isAi={isAi}
          setIsAi={setIsAi}
        />
      </div>

      <ExploreGallery
        key={tab}
        tab={tab}
        selectedMedium={selectedMedium}
        selectedAttributes={selectedAttributes}
        isAi={isAi}
      />

      <Paper className="dark:bg-mountain-800 fixed bottom-4 left-1/2 z-50 transform rounded-full bg-white shadow-lg">
        <ToggleButtonGroup
          className="m-1.5 flex gap-2"
          size="small"
          value={tab}
          exclusive
          onChange={handleTabChange}
          aria-label="Filter posts"
        >
          <ToggleButton
            color="primary"
            className="data-[selected]:dark:bg-primary-700 dark:text-mountain-100 -m-0.5 rounded-full border-0 px-4 py-2 normal-case data-[selected]:dark:text-white"
            value={'Trending' as ExploreTab}
          >
            Trending
          </ToggleButton>
          {token && (
            <ToggleButton
              color="primary"
              className="data-[selected]:dark:bg-primary-700 dark:text-mountain-100 -m-0.5 rounded-full border-0 px-4 py-2 normal-case data-[selected]:dark:text-white"
              value={'Following' as ExploreTab}
            >
              Following
            </ToggleButton>
          )}
        </ToggleButtonGroup>
      </Paper>
    </div>
  );
};

export default memo(Explore);
