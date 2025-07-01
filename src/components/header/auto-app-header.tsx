import UserButton from '@/components/header/user-button';
import UserInAppConfigs from '@/components/popovers/UserInAppConfigs';
import { useUser } from '@/contexts/UserProvider';
import Tooltip from '@mui/material/Tooltip';
import { InfoIcon } from 'lucide-react';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const AutoPostHeader = () => {
  const { user, loading } = useUser();

  return (
    <nav
      className={`z-50 flex relative justify-between items-center bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-50 dark:bg-mountain-950 px-4 border-b-1 border-b-mountain-100 dark:border-b-mountain-700 w-full h-16`}
    >
      <div className="flex items-center h-full">
        <Link
          to="/auto/projects"
          className="flex justify-center items-center hover:bg-mountain-100 mr-4 p-2 rounded-lg"
        >
          <FaArrowLeftLong className="size-5 text-mountain-600" />
        </Link>
        <div className="flex items-center space-x-2">
          <span className="flex font-medium text-lg">Automation Projects</span>
          <Tooltip title={'Return Home'}>
            <InfoIcon className="size-4" />
          </Tooltip>
        </div>
      </div>
      <div className={`flex items-center h-full space-x-2`}>
        <UserButton user={user!} loading={loading!} />
        <UserInAppConfigs />
      </div>
    </nav>
  );
};

export default AutoPostHeader;
