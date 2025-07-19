import { useUser } from '@/contexts/user';
import UserPosts from '@/features/user-profile-private/components/UserPosts';
import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import UserPublicCollections from '../user-profile-public/components/UserPublicCollections';
import { useUserProfile } from '../user-profile-public/hooks/useUserProfile';
import { UserProfileCard } from '../user-profile-public/UserProfileCard';
import UserBlogs from './components/UserBlogs';

const UserProfile = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
  const { username } = useParams<{ username: string }>();
  const { user } = useUser();

  const { data: profileData } = useUserProfile(username);

  const isOwnProfile = user?.id === profileData?.id;

  return (
    <Box className="dark:bg-mountain-1000 from-mountain-50 sidebar h-[calc(100vh-4rem)] rounded-t-3xl bg-gradient-to-b to-white">
      {/* Container for Posts + Profile Sidebar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          height: '100%',
        }}
        className="p-2 pl-6 rounded-t-3xl"
      >
        {/* TOP SECTION: Profile card */}
        <div className="relative flex flex-col justify-end w-full bg-white border dark:bg-mountain-950 border-mountain-200 h-72 shrink-0 rounded-3xl">
          <div className="absolute top-0 left-0 w-full h-32 dark:from-mountain-950 dark:to-mountain-1000 rounded-t-3xl bg-gradient-to-b from-indigo-200 to-purple-100" />
          <div className="z-50 flex items-center justify-start w-full h-full px-4">
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
            className="z-50 flex w-full h-12 px-6 border-mountain-200 shrink-0 rounded-b-3xl border-t-1"
          >
            <Tab
              label="Posts"
              sx={{ textTransform: 'none', minHeight: 0, minWidth: 0 }}
            />
            <Tab
              label="Blogs"
              sx={{ textTransform: 'none', minHeight: 0, minWidth: 0 }}
            />
            {!isOwnProfile && (
              <Tab
                label="Collections"
                sx={{ textTransform: 'none', minHeight: 0, minWidth: 0 }}
              />
            )}
          </Tabs>
        </div>
        {/* BOTTOM SECTION: Posts */}
        <Box sx={{ width: '100%' }}>
          {selectedTab === 0 && <UserPosts />}
          {selectedTab === 1 && <UserBlogs />}
          {selectedTab === 2 && !isOwnProfile && username && (
            <UserPublicCollections username={username} />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default UserProfile;
