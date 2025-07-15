import { Link } from 'react-router-dom';

//Icons
import { FaArrowLeftLong } from 'react-icons/fa6';

//Components
import UserInAppConfigs from '../../../components/popovers/UserInAppConfigs';

//Context
import { useUser } from '@/contexts/user/useUser';
import UserButton from '../../../components/header/user-button';

const EditHeader: React.FC = () => {
  const { user, loading } = useUser();
  return (
    <nav
      className={`border-mountain-200 dark:bg-mountain-950 dark:border-b-mountain-700 relative z-50 flex h-16 w-full items-center justify-between border-b-1 pr-4`}
    >
      <div className="flex w-full items-center justify-between p-4">
        <div className="flex space-x-2">
          <Link
            to="/explore"
            className="bg-mountain-50 hover:bg-mountain-100/80 border-mountain-100 flex h-10 items-center rounded-lg border px-4"
          >
            <div className="hover:bg-mountain-100 mr-2 flex items-center justify-center rounded-lg">
              <FaArrowLeftLong className="text-mountain-600 size-5" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="flex font-medium">Dashboard</span>
            </div>
          </Link>
        </div>
      </div>
      <div className={`flex h-full items-center space-x-2`}>
        <UserButton user={user!} loading={loading!} />
        <UserInAppConfigs />
      </div>
    </nav>
  );
};

export default EditHeader;
