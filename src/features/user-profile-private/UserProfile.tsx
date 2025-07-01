// import { useParams } from "react-router-dom";
// import { useUser } from "@/contexts/UserProvider";
import UserPosts from "@/features/user-profile-private/components/UserPosts";
import { Box, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { UserProfileCard } from "../user-profile-public/UserProfileCard";
import UserBlogs from "./components/UserBlogs";

const UserProfile = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Box className="sm:px-2 md:px-3 lg:px-3 py-3 bg-white dark:bg-mountain-1000 text-white">
      {/* Container for Posts + Profile Sidebar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          minHeight: "100vh",
        }}
        className="shadow p-2 rounded-md"
      >
        {/* TOP SECTION: Profile card */}
        <Box
          className="bg-[#E4E6EB] dark:bg-mountain-950 p-8 rounded-lg rounded-t-3xl w-full"
          sx={{
            overflowY: "auto",
          }}
        >
          <UserProfileCard />
        </Box>

        {/* BOTTOM SECTION: Posts */}
        <Box sx={{ width: "100%" }}>
          <Box sx={{ mb: 3 }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              textColor="inherit"
              indicatorColor="primary"
              sx={{
                minHeight: 0,
                ".MuiTabs-flexContainer": { gap: 2 },
              }}
            >
              <Tab
                label="All posts"
                sx={{ textTransform: "none", minHeight: 0, minWidth: 0 }}
              />
              <Tab
                label="All blogs"
                sx={{ textTransform: "none", minHeight: 0, minWidth: 0 }}
              />
            </Tabs>
          </Box>
          {selectedTab === 0 && <UserPosts />}
          {selectedTab === 1 && <UserBlogs />}
        </Box>
      </Box>
    </Box>
  );
};

export default UserProfile;
