import { Dispatch, SetStateAction } from 'react';
import { Link, useLocation } from 'react-router-dom';

//Assets
import app_logo from '/logo_app_v_101.png';

//Icons
import { Home } from 'lucide-react';
import { GoSidebarExpand } from 'react-icons/go';
import { HiOutlineNewspaper } from 'react-icons/hi2';
import { IoReorderThreeOutline } from 'react-icons/io5';
import { LuBookOpenText } from 'react-icons/lu';
import {
  MdAutoMode,
  MdOutlineCollectionsBookmark,
  MdOutlineExplore,
  MdOutlineLibraryBooks,
  MdOutlineManageAccounts,
} from 'react-icons/md';
import { RiImageAiLine, RiImageEditLine } from 'react-icons/ri';

// import UserPlan from "./subscription";
import { Tooltip } from '@mui/material';

type SidebarProps = {
  expand: boolean;
  setExpand: Dispatch<SetStateAction<boolean>>;
};

const Sidebar: React.FC<SidebarProps> = ({ expand, setExpand }) => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <aside
      className={`${expand ? 'w-60' : 'w-16'} h-screen transition-all ease-in-out duration-500 top-0 z-20 sticky xs:flex flex-col flex-shrink-0 flex-none justify-between dark:bg-mountain-950 dark:border-r-mountain-700 overflow-hidden`}
    >
      <div className="flex flex-col">
        {/* Sidebar Header */}
        <div className="flex justify-between items-center px-4 h-16">
          <div
            className={`flex items-center overflow-hidden ease-in-out transition-all duration-500 ${expand ? 'w-auto opacity-100' : 'opacity-0'}`}
          >
            <img src={app_logo} className="flex mr-2 rounded-sm w-6 h-6" />
            <p className="font-medium text-gray-800 dark:text-gray-100">
              ArtShare
            </p>
          </div>
          <div className="flex-grow" />
          <div
            onClick={() => setExpand(!expand)}
            className={`flex dark:hover:bg-mountain-800 justify-center items-center rounded-full w-6 h-6 hover:cursor-pointer max-pointer-events-none`}
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
          className={`flex flex-col space-y-6 px-2 h-[calc(100vh)] overflow-x-hidden text-mountain-800 dark:text-gray-300`}
        >
          <div className="flex flex-col justify-between items-center space-y-1 w-full">
            {[
              { icon: Home, label: 'Dashboard', href: '/dashboard' },
              {
                icon: MdOutlineExplore,
                label: 'Explore Arts',
                href: '/explore',
              },
              {
                icon: MdOutlineLibraryBooks,
                label: 'Read Blogs',
                href: '/blogs',
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
                    className={`group flex hover:bg-mountain-50 items-center px-4 rounded-md w-full h-10 cursor-pointer
                      ${isActive
                        ? 'text-white'
                        : 'text-violet-900'}
                      `}
                    style={
                      isActive
                        ? {
                          backgroundImage:
                            'linear-gradient(to right, #a855f7, #6366f1, #3b82f6, #06b6d4)',
                        }
                        : undefined
                    }
                  >
                    <item.icon className="flex-shrink-0 size-5" />
                    <div
                      className={`overflow-hidden transition-all duration-500 origin-left ${expand ? 'ml-2 w-auto' : 'w-0'
                        }`}
                    >
                      <p
                        className={`text-nowrap transition-opacity duration-500 ${expand ? 'opacity-100' : 'opacity-0'
                          } ${isActive ? 'font-medium' : 'font-normal'}`}
                      >
                        {item.label}
                      </p>
                    </div>
                  </Link>
                </Tooltip>
              );
            })}
          </div>
          <div className="flex flex-col justify-between items-center space-y-1 w-full">
            {[
              { icon: LuBookOpenText, label: 'My Post', href: '/posts/new' },
              { icon: HiOutlineNewspaper, label: 'My Writing', href: '/docs' },
              {
                icon: MdOutlineCollectionsBookmark,
                label: 'My Collections',
                href: '/collections',
              },
            ].map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === '/docs' && pathname.startsWith('/docs'));
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
                    className={`
                      group flex items-center px-4 rounded-md w-full h-10 hover:bg-mountain-50 cursor-pointer
                      ${isActive
                        ? 'text-white'
                        : 'text-violet-900'
                      }
                    `}
                    style={
                      isActive
                        ? {
                          backgroundImage:
                            'linear-gradient(to right, #a855f7, #6366f1, #3b82f6, #06b6d4)',
                        }
                        : undefined
                    }
                  >
                    <item.icon className="flex-shrink-0 size-5" />
                    <div
                      className={`overflow-hidden transition-all duration-500 origin-left ${expand ? 'ml-2 w-auto' : 'w-0'}`}
                    >
                      <p
                        className={`text-nowrap transition-opacity duration-500 ${expand ? 'opacity-100' : 'opacity-0'} ${isActive ? 'font-medium' : 'font-normal'}`}
                      >
                        {item.label}
                      </p>
                    </div>
                  </Link>
                </Tooltip>
              );
            })}
          </div>
          <div className="flex flex-col justify-between items-center space-y-1 w-full">
            {[
              { icon: RiImageAiLine, label: 'Image Generation', href: '/image/tool/text-to-image' },
              { icon: RiImageEditLine, label: 'Image Editor', href: '/image/tool/editor/new' },
            ].map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === '/docs' && pathname.startsWith('/docs'));
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
                    className={`
                      group flex items-center px-4 rounded-md hover:bg-mountain-50 w-full h-10 cursor-pointer
                      ${isActive
                        ? 'text-white'
                        : 'text-violet-900'
                      }
                    `}
                    style={
                      isActive
                        ? {
                          backgroundImage:
                            'linear-gradient(to right, #a855f7, #6366f1, #3b82f6, #06b6d4)',
                        }
                        : undefined
                    }
                  >
                    <item.icon className="flex-shrink-0 size-5" />
                    <div
                      className={`overflow-hidden transition-all duration-500 origin-left ${expand ? 'ml-2 w-auto' : 'w-0'}`}
                    >
                      <p
                        className={`text-nowrap transition-opacity duration-500 ${expand ? 'opacity-100' : 'opacity-0'} ${isActive ? 'font-medium' : 'font-normal'}`}
                      >
                        {item.label}
                      </p>
                    </div>
                  </Link>
                </Tooltip>
              );
            })}
          </div>
          <div className="flex flex-col justify-between items-start space-y-1 w-full">
            <p
              className={`text-nowrap px-4 text-sm transition-opacity duration-500 ${expand ? 'opacity-100' : 'opacity-0'} font-normal`}
            >
              Social Automation
            </p>
            {[
              { icon: MdOutlineManageAccounts, label: 'Link Socials', href: '/auto/social-links' },
              { icon: MdAutoMode, label: 'Post Automation', href: '/auto/projects' },
            ].map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === '/docs' && pathname.startsWith('/docs'));
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
                    className={`
                      group flex items-center px-4 rounded-md w-full h-10 cursor-pointer hover:bg-mountain-50
                      ${isActive
                        ? 'text-white'
                        : 'text-violet-900'
                      }
                    `}
                    style={
                      isActive
                        ? {
                          backgroundImage:
                            'linear-gradient(to right, #a855f7, #6366f1, #3b82f6, #06b6d4)',
                        }
                        : undefined
                    }
                  >
                    <item.icon className="flex-shrink-0 size-5" />
                    <div
                      className={`overflow-hidden transition-all duration-500 origin-left ${expand ? 'ml-2 w-auto' : 'w-0'}`}
                    >
                      <p
                        className={`text-nowrap transition-opacity duration-500 ${expand ? 'opacity-100' : 'opacity-0'} ${isActive ? 'font-medium' : 'font-normal'}`}
                      >
                        {item.label}
                      </p>
                    </div>
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

export default Sidebar;
