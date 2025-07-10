import React from 'react';

//Api/Hooks

//Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

//Icons
import { BsChevronExpand } from 'react-icons/bs';
import { TbChessQueenFilled } from 'react-icons/tb';

type UserPlanProps = {
  expand: boolean;
};

const UserPlan: React.FC<UserPlanProps> = ({ expand }) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="focus-visible:ring-ring mt-4 flex h-12 w-full items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
        {/* Expanded View Trigger */}
        <div
          className={`${!expand ? 'hidden' : 'px-4'} flex h-full w-full items-center justify-between rounded-lg bg-indigo-50 duration-500 ease-in-out dark:bg-slate-800`}
        >
          <div className={`flex items-center space-x-2`}>
            <TbChessQueenFilled className="flex-none shrink-0 text-indigo-600 dark:text-indigo-400" />
            <p
              className={`origin-left font-normal transition-all duration-300 ${expand ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'} line-clamp-1 text-sm text-slate-700 dark:text-slate-200`}
            >
              User Plan
              <span className="text-mountain-400 dark:text-indigo-300">
                {' '}
                - Free
              </span>
            </p>
          </div>
          <BsChevronExpand className="text-slate-500 dark:text-slate-400" />
        </div>
        {/* Collapsed View Trigger ("Plan" button) */}
        <p
          className={`${expand ? 'w-0 opacity-0' : 'w-fit opacity-100'} border-mountain-100 text-mountain-600 rounded-lg border bg-indigo-50 px-2 py-2 text-sm shadow dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300`}
        >
          Plan
        </p>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="border-mountain-100 mb-2 ml-2 w-56 bg-white dark:border-slate-700 dark:bg-slate-800" // Added bg for explicit control, shadcn might do this via its own classes too
        side="right"
      >
        <DropdownMenuLabel className="flex flex-col space-y-1">
          {/* Assuming default text color for this from shadcn is fine, or add dark:text-slate-100 */}
          <p className="text-slate-800 dark:text-slate-100">ArtShare - Beta</p>
          <p className="text-moutain-600 text-xs font-normal dark:text-slate-400">
            v1.4.0
          </p>{' '}
          {/* Corrected typo moutain -> mountain if intended */}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />{' '}
        {/* Optional: Style separator explicitly */}
        <DropdownMenuGroup>
          <DropdownMenuItem className="text-mountain-600 hover:text-mountain-950 transform duration-200 focus:bg-slate-100 focus:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-slate-100">
            <span className="line-clamp-1">29/04/25 - Rework Layout</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-mountain-600 hover:text-mountain-950 transform duration-200 focus:bg-slate-100 focus:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-slate-100">
            <span className="line-clamp-1">28/04/25 - Image Editor</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserPlan;
