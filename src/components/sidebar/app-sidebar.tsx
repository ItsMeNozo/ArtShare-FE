import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

//Assets
import app_logo from '/logo_app_v_101.png';

//Icons
import { ChevronRight, Home } from 'lucide-react';
import { BiEdit } from 'react-icons/bi';
import { GoSidebarExpand } from 'react-icons/go';
import { HiOutlineNewspaper } from 'react-icons/hi2';
import { IoReorderThreeOutline } from 'react-icons/io5';
import { LuBookOpenText } from 'react-icons/lu';
import {
  MdAutoMode,
  MdOutlineCollectionsBookmark,
  MdOutlineExplore,
  MdOutlineLibraryBooks,
} from 'react-icons/md';
import { RiImageAiLine } from 'react-icons/ri';

//Components
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
// import UserPlan from "./subscription";
import { Popover, Tooltip } from '@mui/material';

type SidebarProps = {
  expand: boolean;
  setExpand: Dispatch<SetStateAction<boolean>>;
};

const Sidebar: React.FC<SidebarProps> = ({ expand, setExpand }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const [openAI, setOpenAI] = useState(true);
  const [openAuto, setOpenAuto] = useState(true);

  useEffect(() => {
    if (!expand) {
      setOpenAI(false);
      setOpenAuto(false);
    }
  }, [expand]);

  type PopoverType = 'ai' | 'auto' | null;

  const [anchorEl, setAnchorEl] = useState<{
    [key in NonNullable<PopoverType>]?: HTMLElement;
  }>({});
  const [openPopover, setOpenPopover] = useState<PopoverType>(null);

  const handleClick =
    (type: PopoverType) => (event: React.MouseEvent<HTMLElement>) => {
      if (!expand) {
        setAnchorEl((prev) => ({ ...prev, [type!]: event.currentTarget }));
        setOpenPopover(type);
      }
    };

  const handleClose = (type: PopoverType) => {
    setAnchorEl((prev) => ({ ...prev, [type!]: undefined }));
    if (openPopover === type) setOpenPopover(null);
  };

  const isOpen = (type: PopoverType) => openPopover === type;
  const getId = (type: PopoverType) =>
    isOpen(type) ? `${type}-popover` : undefined;

  return (
    <aside
      className={`${expand ? 'w-60' : 'w-16'} h-screen transition-all ease-in-out duration-500 top-0 z-20 sticky xs:flex flex-col border-r-1 border-indigo-200 flex-shrink-0 flex-none justify-between dark:bg-mountain-950 dark:border-r-mountain-700 overflow-hidden`}
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
                    className={`
                      group flex items-center px-4 rounded-md w-full h-10 hover:cursor-pointer transition-colors duration-150
                      ${
                        isActive
                          ? 'from-indigo-200 to-purple-200 bg-gradient-to-r text-indigo-700 dark:text-indigo-700 font-medium' // Active state: light gradient, darker text
                          : 'text-violet-900 dark:text-[#7986cb] hover:bg-gray-100 dark:hover:bg-mountain-800 hover:text-violet-950 dark:hover:text-white' // Inactive state
                      }
                    `}
                  >
                    <item.icon className="flex-shrink-0 size-5" />
                    <div
                      className={`overflow-hidden transition-all duration-500 origin-left ${expand ? 'ml-2 w-auto' : 'w-0'}`}
                    >
                      <p
                        className={`text-nowrap transition-opacity duration-500 ${expand ? 'opacity-100' : 'opacity-0'} ${isActive ? 'font-medium' : 'font-thin'}`}
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
                      group flex items-center px-4 rounded-md w-full h-10 hover:cursor-pointer transition-colors duration-150
                      ${
                        isActive
                          ? 'from-indigo-200 to-purple-200 bg-gradient-to-r text-indigo-700 dark:text-indigo-700 font-medium' // Active state
                          : 'text-violet-900 dark:text-[#7986cb] hover:bg-gray-100 dark:hover:bg-mountain-800 hover:text-violet-950 dark:hover:text-white' // Inactive state
                      }
                    `}
                  >
                    <item.icon className="flex-shrink-0 size-5" />
                    <div
                      className={`overflow-hidden transition-all duration-500 origin-left ${expand ? 'ml-2 w-auto' : 'w-0'}`}
                    >
                      <p
                        className={`text-nowrap transition-opacity duration-500 ${expand ? 'opacity-100' : 'opacity-0'} ${isActive ? 'font-medium' : 'font-thin'}`}
                      >
                        {item.label}
                      </p>
                    </div>
                  </Link>
                </Tooltip>
              );
            })}
          </div>
          <div className="flex flex-col">
            <Collapsible
              open={expand ? openAI : false}
              onOpenChange={(value) => expand && setOpenAI(value)}
              className="flex flex-col w-full"
            >
              <CollapsibleTrigger asChild onClick={handleClick('ai')}>
                <button
                  className={`group flex px-4 text-mountain-600 dark:text-[#7986cb] justify-between items-center hover:bg-gray-100 dark:hover:bg-mountain-800 hover:text-mountain-900 dark:hover:text-white py-2 rounded-md w-full transition`}
                >
                  <div className="flex items-center space-x-2">
                    <RiImageAiLine className="size-5" />
                    <p
                      className={`text-nowrap transition-opacity duration-500 ${expand ? 'opacity-100' : 'opacity-0'} font-thin`}
                    >
                      Art Studio
                    </p>
                  </div>
                  <ChevronRight
                    className={`size-4 group-data-[state=open]:rotate-90 transition-transform duration-500 ${!expand && 'hidden'}`}
                  />
                </button>
              </CollapsibleTrigger>
              <Popover
                id={getId('ai')}
                open={isOpen('ai')}
                anchorEl={anchorEl.ai}
                disableScrollLock
                onClose={() => handleClose('ai')}
                anchorOrigin={{
                  vertical: 'center',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'center',
                  horizontal: 'left',
                }}
                slotProps={{
                  paper: {
                    className:
                      'relative w-40 ml-2 mt-8 rounded-md shadow-lg overflow-visible dark:bg-mountain-900 dark:text-gray-200',
                  },
                }}
              >
                <div className="top-16 -left-1.5 z-10 absolute bg-indigo-100 dark:bg-mountain-800 shadow-sm border-gray-200 dark:border-mountain-700 border-t border-l w-3 h-3 rotate-45 -translate-y-1/2" />
                <div className="flex flex-col space-y-1">
                  <div className="space-y-1 bg-indigo-100 dark:bg-mountain-800 p-2 border-mountain-200 dark:border-mountain-700 border-b-1 rounded-t-lg">
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      AI Studio
                    </p>
                    <p className="text-mountain-600 dark:text-mountain-300 text-xs leading-tight">
                      Generate and edit images with AI assistant.
                    </p>
                  </div>
                  <Link
                    to="/image/tool/text-to-image"
                    className="flex items-center p-2 border-mountain-200 dark:border-mountain-700 border-b-1 text-gray-700 hover:text-blue-600 dark:hover:text-blue-400 dark:text-gray-300 text-sm"
                  >
                    <RiImageAiLine className="mr-2 size-4" />
                    <p>Text To Image</p>
                  </Link>
                  {/* <Link
                    to="/image/tool/upscale"
                    className="flex items-center p-2 border-mountain-200 dark:border-mountain-700 border-b-1 text-gray-700 hover:text-blue-600 dark:hover:text-blue-400 dark:text-gray-300 text-sm"
                  >
                    <LuImageUpscale className="mr-2 size-4" />
                    <p>Creative Upscale</p>
                  </Link> */}
                  <Link
                    to="/image/tool/editor"
                    className="flex items-center p-2 text-gray-700 hover:text-blue-600 dark:hover:text-blue-400 dark:text-gray-300 text-sm"
                  >
                    <BiEdit className="mr-2 size-4" />
                    <p>Image Editor</p>
                  </Link>
                </div>
              </Popover>
              <CollapsibleContent className="space-y-1 ml-6 px-1 border-purple-800 dark:border-purple-600 border-l-1 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                {[
                  {
                    label: 'Image Generation',
                    href: '/image/tool/text-to-image',
                  },
                  // { label: "Creative Upscale", href: "#" },
                  { label: 'Image Editor', href: '/image/tool/editor' },
                ].map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      to={item.href}
                      key={index}
                      className={`
                        group flex pr-1.5 items-center rounded-md justify-between w-full h-8 hover:cursor-pointer transition-colors duration-150
                        ${
                          isActive
                            ? 'text-black dark:text-white font-medium' // Active state
                            : 'text-violet-800 dark:text-[#7986cb] hover:bg-gray-50 dark:hover:bg-mountain-800 hover:text-violet-950 dark:hover:text-white' // Inactive state
                        }
                      `}
                    >
                      <div className="relative flex justify-center items-center transition-all duration-500">
                        <hr className="left-0 absolute border-violet-800 border-t-1 w-3" />
                        <p
                          className={`flex text-nowrap ml-4 transition-opacity duration-500 opacity-100 font-regular`}
                        >
                          {item.label}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
            <Collapsible
              open={expand ? openAuto : false}
              onOpenChange={(value) => expand && setOpenAuto(value)}
              className="flex flex-col w-full"
            >
              <CollapsibleTrigger asChild onClick={handleClick('auto')}>
                <button
                  className={`group flex px-4 text-violet-700 dark:text-[#7986cb] justify-between items-center hover:bg-gray-100 dark:hover:bg-mountain-800 hover:text-violet-950 dark:hover:text-white py-2 rounded-md w-full transition hover:cursor-pointer`}
                >
                  <div className="flex items-center space-x-2">
                    <MdAutoMode className="size-5" />
                    <p
                      className={`text-nowrap transition-opacity duration-500 ${expand ? 'opacity-100' : 'opacity-0'} font-thin`}
                    >
                      Social Automation
                    </p>
                  </div>
                  <ChevronRight
                    className={`size-4 group-data-[state=open]:rotate-90 transition-transform duration-500 ${!expand && 'hidden'}`}
                  />
                </button>
              </CollapsibleTrigger>
              <Popover
                id={getId('auto')}
                open={isOpen('auto')}
                anchorEl={anchorEl.auto}
                disableScrollLock
                onClose={() => handleClose('auto')}
                anchorOrigin={{
                  vertical: 'center',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'center',
                  horizontal: 'left',
                }}
                slotProps={{
                  paper: {
                    className:
                      'relative w-40 ml-2 mt-8 rounded-md shadow-lg overflow-visible dark:bg-mountain-900 dark:text-gray-200',
                  },
                }}
              >
                <div className="top-16 -left-1.5 z-10 absolute bg-indigo-100 dark:bg-mountain-800 shadow-sm border-gray-200 dark:border-mountain-700 border-t border-l w-3 h-3 rotate-45 -translate-y-1/2" />
                <div className="flex flex-col space-y-1">
                  <div className="space-y-1 bg-indigo-100 dark:bg-mountain-800 p-2 border-mountain-200 dark:border-mountain-700 border-b-1 rounded-t-lg">
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      Social Automation
                    </p>{' '}
                    {/* Changed title for clarity */}
                    <p className="text-mountain-600 dark:text-mountain-300 text-xs leading-tight">
                      Automate your social media activities.
                    </p>{' '}
                    {/* Changed description */}
                  </div>
                  <Link
                    to="/social/connect"
                    className="flex items-center p-2 border-mountain-200 dark:border-mountain-700 border-b-1 text-gray-700 hover:text-blue-600 dark:hover:text-blue-400 dark:text-gray-300 text-sm"
                  >
                    <MdAutoMode className="mr-2 size-4" />{' '}
                    {/* Changed icon to match section */}
                    <p>Connect Accounts</p>
                  </Link>
                  <Link
                    to="/social/content-gen"
                    className="flex items-center p-2 border-mountain-200 dark:border-mountain-700 border-b-1 text-gray-700 hover:text-blue-600 dark:hover:text-blue-400 dark:text-gray-300 text-sm"
                  >
                    <RiImageAiLine className="mr-2 size-4" />
                    <p>Generate Content</p>
                  </Link>
                  <Link
                    to="/social/scheduler"
                    className="flex items-center p-2 text-gray-700 hover:text-blue-600 dark:hover:text-blue-400 dark:text-gray-300 text-sm"
                  >
                    <BiEdit className="mr-2 size-4" />
                    <p>Schedule Posts</p>
                  </Link>
                </div>
              </Popover>
              <CollapsibleContent className="space-y-1 ml-6 px-1 border-purple-800 dark:border-purple-600 border-l-1 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                {[
                  { label: 'Link Socials', href: '/auto/social-links' },
                  { label: 'Manage Workflows', href: '/auto/projects' },
                  { label: 'Scheduling Center', href: '#' },
                ].map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      to={item.href}
                      key={index}
                      className={`${isActive ? 'from-indigo-200 to-purple-200 bg-gradient-to-r' : 'text-violet-900'} group flex pr-1.5 items-center rounded-md justify-between w-full h-8 hover:text-mountain-950 hover:cursor-pointer`}
                    >
                      <div className="relative flex justify-center items-center transition-all duration-500">
                        <hr className="left-0 absolute border-violet-800 border-t-1 w-3" />
                        <p
                          className={`flex text-nowrap ml-4 transition-opacity duration-500 opacity-100 font-regular`}
                        >
                          {item.label}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
      {/* Sidebar Footer
      <div className="bottom-2 absolute flex pl-2 w-full">
        <UserPlan expand={expand} />
      </div> */}
    </aside>
  );
};

export default Sidebar;
