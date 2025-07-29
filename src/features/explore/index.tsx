import { Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import React, { memo, useState } from 'react';
import 'react-photo-album/rows.css';
import { ExploreGallery } from './components/ExploreGallery';
import FilterBar from './components/FilterBar';
import { ExploreTab } from './types';

const Explore: React.FC = () => {
  const [tab, setTab] = useState<ExploreTab>('Trending');
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(
    null,
  );
  const [selectedMediums, setSelectedMediums] = useState<string[]>([]);
  const [isAi, setIsAi] = useState(false);
  const token = localStorage.getItem('accessToken');

  const handleTabChange = (
    _: React.MouseEvent<HTMLElement>,
    newTab: ExploreTab,
  ) => {
    if (newTab) setTab(newTab);
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-4em)] min-h-0">
      <div className="z-10 sticky flex flex-col gap-4 bg-gradient-to-t dark:bg-gradient-to-t from-white dark:from-mountain-1000 to-mountain-50 dark:to-mountain-950 px-4 py-1 pt-3 rounded-t-3xl">
        <FilterBar
          selectedAttribute={selectedAttribute}
          setSelectedAttribute={setSelectedAttribute}
          selectedMediums={selectedMediums}
          setSelectedMediums={setSelectedMediums}
          isAi={isAi}
          setIsAi={setIsAi}
        />
      </div>

      <ExploreGallery
        key={tab}
        tab={tab}
        selectedAttribute={selectedAttribute}
        selectedMediums={selectedMediums}
        isAi={isAi}
      />

      <Paper className="bottom-4 left-1/2 z-50 fixed bg-white dark:bg-mountain-800 shadow-lg rounded-full transform">
        <ToggleButtonGroup
          className="flex gap-2 m-1.5"
          size="small"
          value={tab}
          exclusive
          onChange={handleTabChange}
          aria-label="Filter posts"
        >
          <ToggleButton
            color="primary"
            className="data-[selected]:dark:bg-primary-700 -m-0.5 px-4 py-2 border-0 rounded-full data-[selected]:dark:text-white dark:text-mountain-100 normal-case"
            value={'Trending' as ExploreTab}
          >
            Trending
          </ToggleButton>
          {token && (
            <ToggleButton
              color="primary"
              className="data-[selected]:dark:bg-primary-700 -m-0.5 px-4 py-2 border-0 rounded-full data-[selected]:dark:text-white dark:text-mountain-100 normal-case"
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
