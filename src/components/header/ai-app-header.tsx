import { Link } from 'react-router-dom';

//Icons
import { InfoIcon } from 'lucide-react';
import { BiEdit } from 'react-icons/bi';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { RiImageAiLine } from 'react-icons/ri';

//Components
import Tooltip from '@mui/material/Tooltip';
import UserInAppConfigs from '../popovers/UserInAppConfigs';

//Context
import { useUser } from '@/contexts/user/useUser';
import UserButton from './user-button';

const AIHeader = () => {
  const { user, loading } = useUser();

  return (
    <nav
      className={`dark:bg-mountain-950 border-b-mountain-100 dark:border-b-mountain-700 relative z-50 flex h-16 w-full items-center justify-between border-b-1 bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-50 px-4`}
    >
      <div className="flex h-full items-center">
        <Link
          to="/explore"
          className="hover:bg-mountain-100 mr-4 flex items-center justify-center rounded-lg p-2"
        >
          <FaArrowLeftLong className="text-mountain-600 size-5" />
        </Link>
        <div className="flex items-center space-x-2">
          <span className="flex text-lg font-medium">Dashboard</span>
          <Tooltip title={'Return Home'}>
            <InfoIcon className="size-4" />
          </Tooltip>
        </div>
      </div>
      <div className="bg-mountain-50 absolute top-1/2 left-1/2 hidden h-10 w-fit -translate-x-1/2 -translate-y-1/2 items-center justify-between space-x-2 rounded-2xl px-1 lg:flex">
        {[
          {
            label: 'Text To Image',
            href: '/image/tool/text-to-image',
            icon: RiImageAiLine,
          },
          // { label: 'Creative Upscale', href: '/image/tool/upscale', icon: LuImageUpscale },
          { label: 'Image Editor', href: '/image/tool/editor', icon: BiEdit },
        ].map((item, index) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={index}
              to={item.href}
              className={`${isActive ? 'text-mountain-950' : 'text-mountain-400'} text-mountain-600 hover:text-mountain-950 flex h-full w-40 transform items-center justify-center space-x-2 rounded-lg bg-white py-1.5 shadow duration-200 ease-in-out hover:scale-105 hover:cursor-pointer`}
            >
              <item.icon className="size-4" />
              <p className="text-sm">{item.label}</p>
            </Link>
          );
        })}
      </div>
      <div className={`flex h-full items-center space-x-2`}>
        <UserButton user={user!} loading={loading!} />
        <UserInAppConfigs />
      </div>
    </nav>
  );
};

export default AIHeader;
