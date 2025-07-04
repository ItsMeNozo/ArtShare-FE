import { useSearch } from '@/contexts/SearchProvider';
import { useUser } from '@/contexts/user/useUser';
import { HeaderRoute, routesForHeaders } from '@/utils/constants';
import React, { useRef, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa6';
import { FiSearch } from 'react-icons/fi';
import { TiDeleteOutline } from 'react-icons/ti';
import { matchPath, useLocation, useNavigate, useParams } from 'react-router-dom';
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
  params: Record<string, string>
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
      const parentRoute = routesForHeaders.find((r) => r.path === route!.parent);
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
    Object.entries(params).map(([k, v]) => [k, v ?? ''])
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
      className={`py-4 pr-4 top-0 z-50 sticky flex justify-between items-center dark:bg-mountain-950 dark:border-b-mountain-700 w-full h-16`}
    >
      <div className="flex items-center h-full">
        <div className="flex items-center h-full">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-2 bg-white rounded-full">
              <Button
                disabled={!hasBack}
                onClick={() => navigate(-1)}
                className="flex justify-center items-center bg-white hover:bg-mountain-100 border-1 border-mountain-100 rounded-full w-8 h-8 text-mountain-950 cursor-pointer"
              >
                <FaArrowLeft />
              </Button>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  {index > 0 && <span className="px-1 text-gray-400">/</span>}
                  <span
                    className={`font-normal text-base`}
                  >
                    {crumb.label}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div
            className={`dark:bg-mountain-1000 focus-within:text-mountain-950 dark:focus-within:text-mountain-50 absolute top-1/2 left-1/2 hidden h-10 -translate-x-1/2 -translate-y-1/2 items-center rounded-2xl text-neutral-700 transition-all duration-300 ease-in-out lg:flex dark:text-neutral-300 ${isFocused ? 'w-108' : 'w-96'}`}
          >
            <FiSearch className="top-1/2 left-2 absolute w-5 h-5 -translate-y-1/2" />
            <Input
              ref={inputRef}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="bg-mountain-50 shadow-inner pl-8 rounded-2xl w-full"
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
          <div className="lg:hidden flex items-center border-white dark:border-mountain-950 border-b-4 h-full">
            <div className="hidden md:flex items-center space-x-1:lg:space-x-2 hover:bg-mountain-100 dark:hover:bg-mountain-1000 mt-1 p-2 rounded-lg text-mountain-500 hover:text-mountain-800 dark:hover:text-mountain-50 hover:cursor-pointer lg">
              <FiSearch className="w-6 h-6" />
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
