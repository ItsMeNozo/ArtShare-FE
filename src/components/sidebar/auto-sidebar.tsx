import { Dispatch, SetStateAction } from 'react';
import { Link, useLocation } from 'react-router-dom';

//Assets
import app_logo from '/logo_app_v_101.png';

//Icons
import { Calendar, ChevronRight, Home } from 'lucide-react';
import { GoSidebarExpand } from 'react-icons/go';
import { IoDocumentTextOutline, IoReorderThreeOutline } from 'react-icons/io5';
import {
  MdAutoMode,
  MdOutlineManageAccounts,
} from 'react-icons/md';

// import UserPlan from "./subscription";
import { Tooltip } from '@mui/material';
import { PiVideo } from 'react-icons/pi';
import { LuMessageCircleCode } from 'react-icons/lu';

type SidebarProps = {
  expand: boolean;
  setExpand: Dispatch<SetStateAction<boolean>>;
};

const AutoSidebar: React.FC<SidebarProps> = ({ expand, setExpand }) => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <aside
      className={`${expand ? 'w-60' : 'w-16'} xs:flex dark:bg-mountain-950 dark:border-r-mountain-700 sticky top-0 z-20 h-screen flex-none flex-shrink-0 flex-col justify-between overflow-hidden transition-all duration-500 ease-in-out`}
    >
      <div className="flex flex-col">
        {/* Sidebar Header */}
        <div className="flex justify-between items-center px-4 h-16">
          <div
            className={`flex items-center overflow-hidden transition-all duration-500 ease-in-out ${expand ? 'w-auto opacity-100' : 'opacity-0'}`}
          >
            <img src={app_logo} className="flex mr-2 rounded-sm w-7 h-7" />
            <p className="font-medium text-gray-800 dark:text-gray-100">
              AutoShare
            </p>
          </div>
          <div className="flex-grow" />
          <div
            onClick={() => setExpand(!expand)}
            className={`dark:hover:bg-mountain-800 max-pointer-events-none flex h-6 w-6 items-center justify-center rounded-full hover:cursor-pointer`}
          >
            {expand ? (
              <GoSidebarExpand className="size-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <IoReorderThreeOutline className="size-6 text-gray-600 dark:text-gray-300" />
            )}
          </div>
        </div>
        {/* Sidebar Body */}
        <div
          className={`text-mountain-800 flex h-[calc(100vh)] flex-col space-y-6 overflow-x-hidden px-2 dark:text-gray-300`}
        >
          <div className="flex flex-col justify-between items-start space-y-1 w-full">
            {[
              {
                icon: Home,
                label: 'Return To Artshare',
                href: '/dashboard',
              }
            ].map((item) => {
              const isActive = pathname === item.href
              return (
                <Tooltip
                  title={item.label}
                  key={item.label}
                  placement="right"
                  arrow
                  disableHoverListener={expand}
                >
                  <Link
                    to={item.href}
                    className={`group justify-between text-[15px] hover:bg-mountain-50 flex h-10 w-full cursor-pointer items-center rounded-md px-3.5 border border-mountain-200 text-mountain-900`}
                  >
                    <div className='flex items-center'>
                      <item.icon className="flex-shrink-0 size-5" />
                      <div
                        className={`origin-left overflow-hidden transition-all duration-500 ${expand ? 'ml-2 w-auto' : 'w-0'}`}
                      >
                        <p
                          className={`text-nowrap transition-opacity duration-500 ${expand ? 'opacity-100' : 'opacity-0'} ${isActive ? 'font-medium' : 'font-normal'}`}
                        >
                          {item.label}
                        </p>
                      </div>
                    </div>
                  </Link>
                </Tooltip>
              );
            })}
          </div>
          <div className="flex flex-col justify-between items-start space-y-1 w-full">
            {[
              {
                icon: MdOutlineManageAccounts,
                label: 'Link Socials',
                href: '/auto/social-links',
              },
              {
                icon: MdAutoMode,
                label: 'Automation Project',
                href: '/auto/projects',
              },
              {
                icon: Calendar,
                label: 'Plan Scheduling',
                href: '/auto/scheduling',
              },
            ].map((item) => {
              const isActive = pathname === item.href
              return (
                <Tooltip
                  title={item.label}
                  key={item.label}
                  placement="right"
                  arrow
                  disableHoverListener={expand}
                >
                  <Link
                    to={item.href}
                    className={`group justify-between text-[15px] hover:bg-mountain-50 flex h-10 w-full cursor-pointer items-center rounded-md px-3.5 ${isActive ? 'text-white' : 'text-mountain-900'
                      } `}
                    style={
                      isActive
                        ? {
                          backgroundImage:
                            'linear-gradient(to right, #a855f7, #6366f1, #3b82f6, #06b6d4)',
                        }
                        : undefined
                    }
                  >
                    <div className='flex items-center'>
                      <item.icon className="flex-shrink-0 size-5" />
                      <div
                        className={`origin-left overflow-hidden transition-all duration-500 ${expand ? 'ml-2 w-auto' : 'w-0'}`}
                      >
                        <p
                          className={`text-nowrap transition-opacity duration-500 ${expand ? 'opacity-100' : 'opacity-0'} ${isActive ? 'font-medium' : 'font-normal'}`}
                        >
                          {item.label}
                        </p>
                      </div>
                    </div>
                  </Link>
                </Tooltip>
              );
            })}
          </div>
          <div className="flex flex-col justify-between items-start space-y-1 w-full">
            {[
              {
                icon: LuMessageCircleCode,
                label: 'Updates',
                href: '/dashboard/updates',
              },
              {
                icon: IoDocumentTextOutline,
                label: 'Documentation',
                href: 'https://artshare-docs.vercel.app/',
              },
              {
                icon: PiVideo,
                label: 'App Tutorials',
                href: 'https://www.youtube.com/channel/UCpg3O1quTzj7QpDHdhu6pNw',
              }
            ].map((item, key) => {
              return (
                <Tooltip
                  title={item.label}
                  key={item.label}
                  placement="right"
                  arrow
                  disableHoverListener={expand}
                >
                  <Link
                    to={item.href}
                    target={key === 0 ? '_self' : '_blank'}
                    className={`group justify-between text-[15px] hover:bg-mountain-50 flex h-10 w-full cursor-pointer items-center rounded-md px-3.5 text-mountain-900 `}
                  >
                    <div className='flex items-center'>
                      <item.icon className="flex-shrink-0 size-5" />
                      <div
                        className={`origin-left overflow-hidden transition-all duration-500 ${expand ? 'ml-2 w-auto' : 'w-0'}`}
                      >
                        <p
                          className={`text-nowrap transition-opacity duration-500 ${expand ? 'opacity-100' : 'opacity-0'} font-normal`}
                        >
                          {item.label}
                        </p>
                      </div>
                    </div>
                    {key !== 0 && <ChevronRight className='size-4' />}
                  </Link>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AutoSidebar;
