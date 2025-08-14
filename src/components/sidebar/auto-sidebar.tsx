import { Dispatch, SetStateAction } from 'react';
import { Link, useLocation } from 'react-router-dom';

//Assets
import app_logo from '/logo_app_v_101.png';

//Icons
import { Home } from 'lucide-react';
import { FiExternalLink } from 'react-icons/fi';
import { GoSidebarExpand } from 'react-icons/go';
import { IoDocumentTextOutline, IoReorderThreeOutline } from 'react-icons/io5';
import { MdAutoMode, MdOutlineManageAccounts } from 'react-icons/md';

// import UserPlan from "./subscription";
import { Tooltip } from '@mui/material';
import { LuMessageCircleCode } from 'react-icons/lu';
import { PiVideo } from 'react-icons/pi';

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
        <div className="flex h-16 items-center justify-between px-4">
          <div
            className={`flex items-center overflow-hidden transition-all duration-500 ease-in-out ${expand ? 'w-auto opacity-100' : 'opacity-0'}`}
          >
            <img src={app_logo} className="mr-2 flex h-7 w-7 rounded-sm" />
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
          <div className="flex w-full flex-col items-start justify-between space-y-1">
            {[
              {
                icon: Home,
                label: 'Return To Artshare',
                href: '/dashboard',
              },
            ].map((item) => {
              const isActive = pathname === item.href;
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
                    className={`group hover:bg-mountain-50 border-mountain-200 text-mountain-900 flex h-10 w-full cursor-pointer items-center justify-between rounded-md border px-3.5 text-[15px]`}
                  >
                    <div className="flex items-center">
                      <item.icon className="size-5 flex-shrink-0" />
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
          <div className="flex w-full flex-col items-start justify-between space-y-1">
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
            ].map((item) => {
              const isActive = pathname === item.href;
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
                    className={`group hover:bg-mountain-50 flex h-10 w-full cursor-pointer items-center justify-between rounded-md px-3.5 text-[15px] ${
                      isActive ? 'text-white' : 'text-mountain-900'
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
                    <div className="flex items-center">
                      <item.icon className="size-5 flex-shrink-0" />
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
          <div className="flex w-full flex-col items-start justify-between space-y-1">
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
                href: 'https://www.youtube.com/@artshareofficial',
              },
            ].map((item, key) => {
              const isExternalLink = key !== 0; // Documentation and App Tutorials are external links
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
                    className={`group hover:bg-mountain-50 text-mountain-900 flex h-10 w-full cursor-pointer items-center justify-between rounded-md px-3.5 text-[15px]`}
                  >
                    <div className="flex items-center">
                      <item.icon className="size-5 flex-shrink-0" />
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
                    {isExternalLink && <FiExternalLink className="size-4" />}
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
