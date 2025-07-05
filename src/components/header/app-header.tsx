import { useSearch } from '@/contexts/SearchProvider';
import { useUser } from '@/contexts/user/useUser';
import { HeaderRoute, routesForHeaders } from '@/utils/constants';
import React, { useRef, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa6';
import { FiSearch } from 'react-icons/fi';
import { TiDeleteOutline } from 'react-icons/ti';
import {
  matchPath,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import UserInAppConfigs from '../popovers/UserInAppConfigs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import UserButton from './user-button';

function findMatchedRoute(pathname: string) {
  return routesForHeaders.find((route) =>
    matchPath({ path: route.path, end: true }, pathname),
  );
}

function buildBreadcrumbTrail(
  route: HeaderRoute | null,
  params: Record<string, string>,
): { path: string; label: string }[] {
  const trail = [];
  while (route) {
    let label = route.label;

    // Replace :params in label if needed
    if (route.path.includes(':username') && params.username) {
      label = params.username;
    }

    trail.unshift({ path: route.path, label });
    if (route.parent) {
      const parentRoute = routesForHeaders.find(
        (r) => r.path === route!.parent,
      );
      route = parentRoute ?? null;
    } else {
      route = null;
    }
  }
  return trail;
}

function useBreadcrumbs() {
  const location = useLocation();
  const params = useParams(); // 👈 get dynamic URL segments
  const matchedRoute = findMatchedRoute(location.pathname);
  if (!matchedRoute) return [];
  // Convert params to Record<string, string> by replacing undefined with ''
  const safeParams: Record<string, string> = Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, v ?? '']),
  );
  return buildBreadcrumbTrail(matchedRoute, safeParams);
}

const Header: React.FC = () => {
  const { user, loading } = useUser();
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { setQuery } = useSearch();
  const navigate = useNavigate();

  const breadcrumbs = useBreadcrumbs();
  const hasBack = breadcrumbs.length > 1;

  return (
    <nav
      className={`dark:bg-mountain-950 dark:border-b-mountain-700 sticky top-0 z-50 flex h-16 w-full items-center justify-between py-4 pr-4`}
    >
      <div className="flex h-full items-center">
        <div className="flex h-full items-center">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-2 rounded-full bg-white">
              <Button
                disabled={!hasBack}
                onClick={() => navigate(-1)}
                className="hover:bg-mountain-100 border-mountain-100 text-mountain-950 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-1 bg-white"
              >
                <FaArrowLeft />
              </Button>
            </div>
            <div className="text-muted-foreground flex items-center gap-1 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  {index > 0 && <span className="px-1 text-gray-400">/</span>}
                  <span className={`text-base font-normal`}>{crumb.label}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div
            className={`dark:bg-mountain-1000 focus-within:text-mountain-950 dark:focus-within:text-mountain-50 absolute top-1/2 left-1/2 hidden h-10 -translate-x-1/2 -translate-y-1/2 items-center rounded-2xl text-neutral-700 transition-all duration-300 ease-in-out lg:flex dark:text-neutral-300 ${isFocused ? 'w-108' : 'w-96'}`}
          >
            <FiSearch className="absolute top-1/2 left-2 h-5 w-5 -translate-y-1/2" />
            <Input
              ref={inputRef}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="bg-mountain-50 w-full rounded-2xl pl-8 shadow-inner"
              placeholder="Search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setInputValue('');
                  setQuery(inputValue);
                  inputRef.current?.blur();
                  navigate(`/search?q=${inputValue}`);
                }
              }}
            />
            <TiDeleteOutline
              className={`text-mountain-600 absolute right-2 h-5 w-5 ${inputValue.length <= 0 ? 'hidden' : 'flex'}`}
              onClick={() => {
                setInputValue('');
                setQuery('');
              }}
            />
          </div>
          <div className="dark:border-mountain-950 flex h-full items-center border-b-4 border-white lg:hidden">
            <div className="space-x-1:lg:space-x-2 hover:bg-mountain-100 dark:hover:bg-mountain-1000 text-mountain-500 hover:text-mountain-800 dark:hover:text-mountain-50 lg mt-1 hidden items-center rounded-lg p-2 hover:cursor-pointer md:flex">
              <FiSearch className="h-6 w-6" />
              <p className="text-sm">Search</p>
            </div>
          </div>
        </div>
      </div>
      <div className={`flex h-full items-center space-x-2`}>
        <UserButton user={user!} loading={loading!} />
        <UserInAppConfigs />
      </div>
    </nav>
  );
};

export default Header;
