import { Dispatch, SetStateAction } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

//Assets
import app_logo from '/logo_app_v_101.png';

//Icons
import { Home } from 'lucide-react';
import { FiExternalLink } from 'react-icons/fi';
import { GoSidebarExpand } from 'react-icons/go';
import { HiOutlineNewspaper } from 'react-icons/hi2';
import { IoDocumentTextOutline, IoReorderThreeOutline } from 'react-icons/io5';
import { LuBookOpenText, LuMessageCircleCode } from 'react-icons/lu';
import {
  MdAutoMode,
  MdOutlineExplore,
  MdOutlineLibraryBooks,
  MdOutlinePushPin,
} from 'react-icons/md';
import { RiImageAiLine, RiImageEditLine } from 'react-icons/ri';

// import UserPlan from "./subscription";
import { Tooltip } from '@mui/material';
import { PiVideo } from 'react-icons/pi';

type SidebarProps = {
  expand: boolean;
  setExpand: Dispatch<SetStateAction<boolean>>;
  userRole: string | null;
  onShowUpgradeModal: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({
  expand,
  setExpand,
  userRole,
  onShowUpgradeModal,
}) => {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  return (
    <aside
      className={`${expand ? 'w-60' : 'w-16'} xs:flex dark:bg-mountain-950 dark:border-r-mountain-700 sticky top-0 z-20 h-screen flex-none flex-shrink-0 flex-col justify-between overflow-hidden transition-all duration-500 ease-in-out`}
    >
      <div className="flex flex-col">
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4">
          <Link
            to="/explore"
            className={`flex items-center overflow-hidden transition-all duration-500 ease-in-out ${expand ? 'w-auto opacity-100' : 'opacity-0'}`}
          >
            <img src={app_logo} className="mr-2 flex h-7 w-7 rounded-sm" />
            <p className="font-medium text-gray-800 dark:text-gray-100">
              ArtShare
            </p>
          </Link>
          <div
            onClick={() => setExpand(!expand)}
            className={`dark:hover:bg-mountain-800 max-pointer-events-none flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:cursor-pointer`}
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
          <div className="flex w-full flex-col items-center justify-between space-y-1">
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
              {
                icon: MdOutlinePushPin,
                label: 'Collections',
                href: '/collections',
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
                    className={`group hover:bg-mountain-50 flex h-10 w-full cursor-pointer items-center rounded-md px-3.5 text-[15px] ${
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
                    <item.icon className="size-5 flex-shrink-0" />
                    <div
                      className={`origin-left overflow-hidden transition-all duration-500 ${
                        expand ? 'ml-2 w-auto' : 'w-0'
                      }`}
                    >
                      <p
                        className={`text-nowrap transition-opacity duration-500 ${
                          expand ? 'opacity-100' : 'opacity-0'
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
          <div className="flex w-full flex-col items-center justify-between space-y-1">
            {[
              {
                icon: LuBookOpenText,
                label: 'Create Post',
                href: '/posts/new',
              },
              {
                icon: HiOutlineNewspaper,
                label: 'Write Blog',
                href: '/blogs/write',
              },
            ].map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === '/blogs/write' &&
                  pathname.startsWith('/blogs/write'));
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
                    className={`group hover:bg-mountain-50 flex h-10 w-full cursor-pointer items-center rounded-md px-3.5 text-[15px] ${
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
                  </Link>
                </Tooltip>
              );
            })}
          </div>
          <div className="flex w-full flex-col items-center justify-between space-y-1">
            {[
              {
                icon: RiImageAiLine,
                label: 'Image Generation',
                href: '/image/tool/text-to-image',
              },
              {
                icon: RiImageEditLine,
                label: 'Image Editor',
                href: '/image/tool/editor/new',
              },
            ].map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === '/blogs/write' &&
                  pathname.startsWith('/blogs/write'));
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
                    className={`group hover:bg-mountain-50 flex h-10 w-full cursor-pointer items-center rounded-md px-3.5 text-[15px] ${
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
                  </Link>
                </Tooltip>
              );
            })}
          </div>
          <div className="flex w-full flex-col items-start justify-between space-y-1">
            {[
              {
                icon: MdAutoMode,
                label: 'Post Automation',
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
                  <div
                    onClick={() => {
                      if (userRole === 'free' && userRole !== null) {
                        onShowUpgradeModal();
                      } else {
                        navigate(item.href);
                      }
                    }}
                    className={`group hover:bg-mountain-50 flex h-10 w-full cursor-pointer items-center justify-between rounded-md px-3.5 text-[15px] ${isActive ? 'text-white' : 'text-mountain-900'} `}
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
                    <p
                      className={`from-mountain-200 to-mountain-100 rounded-md bg-gradient-to-r p-2 py-1.5 text-xs ${expand ? '' : 'hidden'}`}
                    >
                      Pro
                    </p>
                  </div>
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
              const isActive = pathname === item.href;
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
                    className={`${isActive ? 'text-white' : 'text-mountain-900'} group hover:bg-mountain-50 flex h-10 w-full cursor-pointer items-center justify-between rounded-md px-3.5 text-[15px]`}
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

export default Sidebar;
