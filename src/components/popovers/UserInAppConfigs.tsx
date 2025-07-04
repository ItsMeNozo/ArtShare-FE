// Core
import { useState } from 'react';

// Context/hooks
import { useUser } from '@/contexts/user';

// Icons
import { useTheme } from '@/hooks/useTheme';
import {
  MdDarkMode,
  MdLightMode,
  MdMailOutline,
  MdMoreVert,
} from 'react-icons/md';
// Components
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
// Avatars
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import BoringAvatar from 'boring-avatars';

import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Button } from '@mui/material';
import { FaRegCircleUser } from 'react-icons/fa6';
import { LuSettings } from 'react-icons/lu';
import { TbChessQueen } from 'react-icons/tb';
import { Link, useNavigate } from 'react-router-dom';

const UserInAppConfigs = () => {
  const { user, loading, logout } = useUser();
  const [open, setOpen] = useState(false);
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [matureContent, setMatureContent] = useState(false);
  const [aiContent, setAiContent] = useState(false);

  const handleLogout = async () => {
    try {
      // Close the popover immediately
      setOpen(false);

      // Call logout immediately - no delay needed
      await logout();

      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Navigate to login anyway in case of error
      navigate('/login');
    }
  };

  if (loading)
    return (
      <>
        <Skeleton className="dark:bg-mountain-900 rounded-full w-10 h-10" />
      </>
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div>
          <Button
            title="User menu"
            className={`flex items-center rounded-full`}
            onClick={() => setOpen(!open)}
            disableRipple
            sx={{
              p: 0,
              minWidth: 0,
              width: 40,
              height: 40,
            }}
          >
            {user ? (
              user.profile_picture_url ? (
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.profile_picture_url} />
                  <AvatarFallback>
                    <BoringAvatar
                      size={40}
                      name={user.username}
                      variant="beam"
                      colors={[
                        '#84bfc3',
                        '#fff5d6',
                        '#ffb870',
                        '#d96153',
                        '#000511',
                      ]}
                    />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <BoringAvatar
                  size={40}
                  name={user.username}
                  variant="beam"
                  colors={[
                    '#84bfc3',
                    '#fff5d6',
                    '#ffb870',
                    '#d96153',
                    '#000511',
                  ]}
                />
              )
            ) : (
              <MdMoreVert className="size-5" />
            )}
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="dark:bg-mountain-900 mt-4 p-0 py-2 border-mountain-100 dark:border-mountain-700 w-64">
        {user && (
          <>
            <div className="flex items-center space-x-2 p-3">
              {user.profile_picture_url ? (
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.profile_picture_url} />
                  <AvatarFallback>
                    <BoringAvatar
                      size={40}
                      name={user.username}
                      variant="beam"
                      colors={[
                        '#84bfc3',
                        '#fff5d6',
                        '#ffb870',
                        '#d96153',
                        '#000511',
                      ]}
                    />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <BoringAvatar
                  size={40}
                  name={user.username}
                  variant="beam"
                  colors={[
                    '#84bfc3',
                    '#fff5d6',
                    '#ffb870',
                    '#d96153',
                    '#000511',
                  ]}
                />
              )}
              <div className="flex flex-col">
                <p className="text-mountain-950 dark:text-mountain-50">
                  {user.username}
                </p>
                <p className="text-mountain-500 text-xs">{user.email}</p>
              </div>
            </div>
            <hr className="my-2 border-mountain-100 dark:border-mountain-800" />
            <Link
              to={`/${user.username}`}
              className="flex items-center space-x-2 hover:bg-mountain-50 dark:hover:bg-mountain-800 p-3"
            >
              <FaRegCircleUser className="text-mountain-600" />
              <FaRegCircleUser className="text-mountain-600" />
              <p className="text-sm">My Profile</p>
            </Link>
            <div className="xs:hidden flex hover:bg-mountain-50 dark:hover:bg-mountain-800 p-3 py-2 w-full hover:cursor-pointer">
              <MdMailOutline className="" />
              <p className="text-sm">Messages</p>
            </div>
            <div className="flex items-center space-x-2 hover:bg-mountain-50 dark:hover:bg-mountain-800 p-3 py-2 w-full hover:cursor-pointer">
              <LuSettings className="text-mountain-600" />
              <p className="text-sm">Settings</p>
            </div>
            <Link
              to={'/app-subscription'}
              className="flex items-center space-x-2 hover:bg-mountain-50 dark:hover:bg-mountain-800 p-3"
            >
              <TbChessQueen className="text-mountain-600" />
              <p className="text-sm">App Subscription</p>
            </Link>
            <hr className="my-2 border-mountain-100 dark:border-mountain-800 border-t-1" />
          </>
        )}

        {/* Theme Toggle */}
        <div className="flex justify-between items-center hover:bg-mountain-50 dark:hover:bg-mountain-800 p-3 py-2 w-full h-full">
          <span className="text-sm">Theme</span>
          <div className="flex space-x-2">
            <Button onClick={toggleTheme}>
              <MdLightMode className="size-5" />
            </Button>
            <Button onClick={toggleTheme}>
              <MdDarkMode className="size-5" />
            </Button>
          </div>
        </div>

        <hr className="my-2 border-mountain-100 dark:border-mountain-800 border-t-1" />

        {/* Content Settings */}
        <div className="flex justify-between items-center hover:bg-mountain-50 dark:hover:bg-mountain-800 p-3 py-2 w-full h-full">
          <span className="text-sm">Mature Content</span>
          <Switch
            checked={matureContent}
            onCheckedChange={setMatureContent}
            className="hover:cursor-pointer"
          />
        </div>

        <div className="flex justify-between items-center hover:bg-mountain-50 dark:hover:bg-mountain-800 p-3 py-2 w-full h-full">
          <span className="text-sm">AI Content</span>
          <Switch
            checked={aiContent}
            onCheckedChange={setAiContent}
            className="hover:cursor-pointer"
          />
        </div>
        {/* Show these options only if the user is not logged in */}
        <>
          <hr className="my-2 border-mountain-100 dark:border-mountain-800 border-t-1" />
          <div className="flex items-center space-x-2 hover:bg-mountain-50 dark:hover:bg-mountain-800 p-3 py-2 w-full">
            <p className="text-sm">Help Center</p>
          </div>
        </>
        {/* Show these options only if the user is logged in */}
        {user && (
          <>
            <hr className="my-2 border-mountain-100 dark:border-mountain-800 border-t-1" />
            <div
              className="flex items-center space-x-2 hover:bg-mountain-50 dark:hover:bg-mountain-800 p-3 py-2 w-full hover:cursor-pointer"
              onClick={handleLogout}
            >
              <p className="text-sm">Logout</p>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default UserInAppConfigs;
