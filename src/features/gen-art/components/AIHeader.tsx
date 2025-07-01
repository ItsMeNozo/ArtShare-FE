import { Link } from "react-router-dom";

//Icons
import { FaArrowLeftLong } from "react-icons/fa6";

//Components
import UserInAppConfigs from "../../../components/popovers/UserInAppConfigs";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

//Context
import { useUser } from "@/contexts/UserProvider";
import UserButton from "../../../components/header/user-button";
import { IoMdArrowDropdown } from "react-icons/io";
import {
  HistoryFilter,
} from "./../enum";

interface AIHeaderProps {
  historyFilter: { label: string; value: string };
  setHistoryFilter: (filter: { label: string; value: string }) => void;
  loading: boolean;
}

const AIHeader: React.FC<AIHeaderProps> = ({ historyFilter, setHistoryFilter }) => {
  const { user, loading } = useUser();

  return (
    <nav className={`z-50 w-[calc(100vw-360px)] flex relative justify-between items-center dark:bg-mountain-950 dark:border-b-mountain-700 h-14`}>
      <div className="flex items-center space-x-2">
        <Link to="/explore" className="flex items-center bg-mountain-50 hover:bg-mountain-100 px-4 border border-mountain-100 rounded-lg h-8">
          <div className='flex justify-center items-center hover:bg-mountain-100 mr-2 rounded-lg'>
            <FaArrowLeftLong className='size-5 text-mountain-600' />
          </div>
          <div className='flex items-center space-x-2'>
            <span className='flex font-medium'>
              Dashboard
            </span>
          </div>
        </Link>
        <div className="flex items-center space-x-2 rounded-xl w-48 h-8">
          <div className="flex justify-start items-center bg-mountain-50 hover:bg-mountain-200/80 px-2 border border-mountain-100 rounded-lg w-full h-full font-normal">
            <DropdownMenu>
              <DropdownMenuTrigger className="justify-start outline-none w-full hover:cursor-pointer">
                <div className="flex items-center space-x-2">
                  <p>
                    Show{" "}
                    <span className="font-medium">
                      {historyFilter.label}
                    </span>
                  </p>
                  <IoMdArrowDropdown />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="flex flex-col mt-4 border-mountain-200 min-w-48 select-none">
                {Object.values(HistoryFilter).map((filter, index) => (
                  <div
                    key={index}
                    onClick={() => setHistoryFilter(filter)}
                    className={`${loading && "pointer-events-none"} flex p-1.5 hover:bg-mountain-100 hover:cursor-pointer ${historyFilter.value == filter.value
                      ? "bg-indigo-50 font-medium text-mountain-800"
                      : ""
                      }`}
                  >
                    {filter.label}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className={`flex items-center h-full space-x-2`}>
        <UserButton user={user!} loading={loading!} />
        <UserInAppConfigs />
      </div>
    </nav>
  )
}

export default AIHeader;
