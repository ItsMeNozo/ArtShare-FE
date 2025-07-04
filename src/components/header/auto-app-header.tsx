import UserButton from '@/components/header/user-button';
import UserInAppConfigs from '@/components/popovers/UserInAppConfigs';
import { useUser } from '@/contexts/user/useUser';
import Tooltip from '@mui/material/Tooltip';
import { InfoIcon } from 'lucide-react';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const AutoPostHeader = () => {
  const { user, loading } = useUser();

  return (
    <nav
      className={`dark:bg-mountain-950 border-b-mountain-100 dark:border-b-mountain-700 relative z-50 flex h-16 w-full items-center justify-between border-b-1 bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-50 px-4`}
    >
      <div className="flex h-full items-center">
        <Link
          to="/auto/projects"
          className="hover:bg-mountain-100 mr-4 flex items-center justify-center rounded-lg p-2"
        >
          <FaArrowLeftLong className="text-mountain-600 size-5" />
        </Link>
        <div className="flex items-center space-x-2">
          <span className="flex text-lg font-medium">Automation Projects</span>
          <Tooltip title={'Return Home'}>
            <InfoIcon className="size-4" />
          </Tooltip>
        </div>
      </div>
      <div className={`flex h-full items-center space-x-2`}>
        <UserButton user={user!} loading={loading!} />
        <UserInAppConfigs />
      </div>
    </nav>
  );
};

export default AutoPostHeader;
