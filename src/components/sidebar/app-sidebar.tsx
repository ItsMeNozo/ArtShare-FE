import { Dispatch, SetStateAction } from 'react';
import { Link, useLocation } from 'react-router-dom';

//Assets
import app_logo from '/logo_app_v_101.png';

//Icons
import { ChevronRight, Home } from 'lucide-react';
import { GoSidebarExpand } from 'react-icons/go';
import { HiOutlineNewspaper } from 'react-icons/hi2';
import { IoDocumentTextOutline, IoReorderThreeOutline } from 'react-icons/io5';
import { LuBookOpenText, LuMessageCircleCode } from 'react-icons/lu';
import {
  MdAutoMode,
  MdOutlineCollectionsBookmark,
  MdOutlineExplore,
  MdOutlineLibraryBooks,
} from 'react-icons/md';
import { RiImageAiLine, RiImageEditLine } from 'react-icons/ri';

// import UserPlan from "./subscription";
import { Tooltip } from '@mui/material';
import { PiVideo } from 'react-icons/pi';

type SidebarProps = {
  expand: boolean;
  setExpand: Dispatch<SetStateAction<boolean>>;
};

const Sidebar: React.FC<SidebarProps> = ({ expand, setExpand }) => {
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
              ArtShare
            </p>
          </div>
          <div
            onClick={() => setExpand(!expand)}
            className={`dark:hover:bg-mountain-800 shrink-0 max-pointer-events-none flex h-6 w-6 items-center justify-center rounded-full hover:cursor-pointer`}
          >
            {expand ? (
              <GoSidebarExpand className="size-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <IoReorderThreeOutline className="mr-1.5 size-6 text-gray-600 dark:text-gray-300" />
            )}
          </div>
        </div>
        {/* Sidebar Body */}
        <div
          className={`text-mountain-800 flex h-[calc(100vh)] flex-col space-y-6 overflow-x-hidden px-2 dark:text-gray-300`}
        >
          <div className="flex flex-col justify-between items-center space-y-1 w-full">
            {[
              { icon: Home, label: 'Home', href: '/dashboard' },
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
                    className={`group hover:bg-mountain-50 text-[15px] flex h-10 w-full cursor-pointer items-center rounded-md px-3.5 ${isActive ? 'text-white' : 'text-mountain-900'
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
                    <item.icon className="flex-shrink-0 size-5" />
                    <div
                      className={`origin-left overflow-hidden transition-all duration-500 ${expand ? 'ml-2 w-auto' : 'w-0'
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
                    className={`group text-[15px] hover:bg-mountain-50 flex h-10 w-full cursor-pointer items-center rounded-md px-3.5 ${isActive ? 'text-white' : 'text-mountain-900'
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
                    className={`group  hover:bg-mountain-50 text-[15px] flex h-10 w-full cursor-pointer items-center rounded-md px-3.5 ${isActive ? 'text-white' : 'text-mountain-900'
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
                  </Link>
                </Tooltip>
              );
            })}
          </div>
          <div className="flex flex-col justify-between items-start space-y-1 w-full">
            {[
              {
                icon: MdAutoMode,
                label: 'Post Automation',
                href: '/auto/projects',
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
                    <p className={`p-2 py-1.5 bg-gradient-to-r from-mountain-200 to-mountain-100 rounded-md text-xs ${expand ? '' : 'hidden'}`}>Pro</p>
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
                href: 'https://artshare-docs.netlify.app/',
              },
              {
                icon: PiVideo,
                label: 'App Tutorials',
                href: 'https://www.youtube.com/channel/UCpg3O1quTzj7QpDHdhu6pNw',
              }
            ].map((item, key) => {
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
                    target={key === 0 ? '_self' : '_blank'}
                    className={`${isActive ? 'text-white' : 'text-mountain-900'} group justify-between text-[15px] hover:bg-mountain-50 flex h-10 w-full cursor-pointer items-center rounded-md px-3.5 `}
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
        </div >
      </div >
    </aside >
  );
};

export default Sidebar;
