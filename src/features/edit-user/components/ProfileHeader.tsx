import { Box, Typography } from '@mui/material';
// import { Launch } from "@mui/icons-material"

export function ProfileHeader() {
  return (
    <Box className="bg-[#1e1e1e] p-6">
      <Box className="flex items-center justify-between">
        <Typography
          variant="h4"
          component="h1"
          className="font-bold dark:text-white"
        >
          Profile
        </Typography>
      </Box>
      <Typography variant="subtitle1" className="mt-2 text-gray-400">
        Update your user profile information if needed
      </Typography>
    </Box>
  );
}
