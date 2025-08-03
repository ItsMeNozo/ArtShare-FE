import UserPosts from '@/features/user-profile-private/components/UserPosts';
import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import UserPublicCollections from '../user-profile-public/components/UserPublicCollections';
import { UserProfileCard } from '../user-profile-public/UserProfileCard';
import UserBlogs from './components/UserBlogs';

const UserProfile = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
  const { username } = useParams<{ username: string }>();

  return (
    <Box className="dark:bg-mountain-1000 from-mountain-50 custom-scrollbar h-[calc(100vh-4rem)] overflow-y-auto rounded-t-3xl bg-gradient-to-b to-white">
      {/* Container for Posts + Profile Sidebar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          height: '100%',
        }}
        className="rounded-t-3xl p-2"
      >
        {/* TOP SECTION: Profile card */}
        <div className="dark:bg-mountain-950 border-mountain-200 relative flex h-72 w-full shrink-0 flex-col justify-end rounded-3xl border bg-white">
          <div className="dark:from-mountain-950 dark:to-mountain-1000 absolute top-0 left-0 h-28 w-full rounded-t-3xl bg-gradient-to-b from-indigo-200 to-purple-100" />
          <div className="z-50 flex h-full w-full items-center justify-start px-4">
            <UserProfileCard />
          </div>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="primary"
            sx={{
              minHeight: 0,
              '.MuiTabs-flexContainer': { gap: 2 },
            }}
            className="border-mountain-200 z-50 flex h-12 w-full shrink-0 rounded-b-3xl border-t-1 px-6"
          >
            <Tab
              label="Posts"
              sx={{ textTransform: 'none', minHeight: 0, minWidth: 0 }}
            />
            <Tab
              label="Blogs"
              sx={{ textTransform: 'none', minHeight: 0, minWidth: 0 }}
            />
            <Tab
              label="Collections"
              sx={{ textTransform: 'none', minHeight: 0, minWidth: 0 }}
            />
          </Tabs>
        </div>
        {/* BOTTOM SECTION: Posts */}
        <Box sx={{ width: '100%', height: '100%' }} className="flex-1 pb-20">
          {selectedTab === 0 && <UserPosts />}
          {selectedTab === 1 && <UserBlogs />}
          {selectedTab === 2 && username && (
            <UserPublicCollections username={username} />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default UserProfile;
