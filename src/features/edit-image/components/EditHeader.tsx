import { Link } from "react-router-dom";

//Icons
import { BiExpandAlt } from "react-icons/bi";
import { IoHome } from "react-icons/io5";

//Components
import UserInAppConfigs from "../../../components/popovers/UserInAppConfigs";
import { Button } from "@/components/ui/button";
import UserButton from "../../../components/header/user-button";

//Context
import { useUser } from '@/contexts/user/useUser';
interface EditHeaderProps {
  hideTopBar: boolean;
  setHideTopBar: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditHeader: React.FC<EditHeaderProps> = ({ hideTopBar, setHideTopBar }) => {
  const { user, loading } = useUser();
  return (
    <nav
      className={`z-50 pr-6 border-b-1 border-mountain-200 w-full flex relative justify-between items-center dark:bg-mountain-950 dark:border-b-mountain-700 h-16
        ${hideTopBar ? "hidden" : ""}
      `}
    >
      <div className="flex justify-between items-center p-4 w-full">
        <div className="flex space-x-2">
          <Link to="/explore" className="flex items-center bg-mountain-50 hover:bg-mountain-100/80 px-4 border border border-mountain-100 border-mountain-200 rounded-lg h-10">
            <div className='flex justify-center items-center hover:bg-mountain-100 mr-2 rounded-lg'>
              <IoHome className='size-5 text-mountain-600' />
            </div>
            <span className='flex font-medium'>
              Dashboard
            </span>
          </Link>
        </div>
        <div className="flex items-center space-x-4 px-4 border-mountain-200 border-r-1">
          <Button
            onClick={() => setHideTopBar((prev) => !prev)}
            className="flex justify-center items-center bg-mountain-50 hover:bg-mountain-100 border border-mountain-200 rounded-lg w-32 h-10 font-medium text-mountain-950 text-sm cursor-pointer">
            <BiExpandAlt className="size-4" />
            Full Screen
          </Button>
        </div>
      </div>
      <div className={`flex items-center h-full space-x-2`}>
        <UserButton user={user!} loading={loading!} />
        <UserInAppConfigs />
      </div>
    </nav >
  )
}

export default EditHeader;
