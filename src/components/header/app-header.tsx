import { useSearch } from '@/contexts/SearchProvider';
import { useUser } from '@/contexts/UserProvider';
import { HeaderRoute, routesForHeaders } from '@/utils/constants';
import React, { useRef, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa6';
import { FiSearch } from 'react-icons/fi';
import { TiDeleteOutline } from 'react-icons/ti';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
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
): { path: string; label: string }[] {
  const trail = [];
  while (route) {
    trail.unshift({ path: route.path, label: route.label });
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
  const matchedRoute = findMatchedRoute(location.pathname);
  if (!matchedRoute) return [];
  return buildBreadcrumbTrail(matchedRoute);
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
      className={`py-4 top-0 z-50 sticky flex justify-between items-center dark:bg-mountain-950 dark:border-b-mountain-700 w-full h-16`}
    >
      <div className="flex items-center h-full">
        <div className="flex items-center h-full">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-2 bg-white rounded-full">
              <Button
                disabled={!hasBack}
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-8 h-8 bg-white rounded-full cursor-pointer hover:bg-mountain-100 border-1 border-mountain-100 text-mountain-950"
              >
                <FaArrowLeft />
              </Button>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  {index > 0 && <span className="px-1 text-gray-400">/</span>}
                  <span
                    className={`${index === breadcrumbs.length - 1 ? 'font-medium text-foreground' : ''} text-lg`}
                  >
                    {crumb.label}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div
            className={`hidden top-1/2 left-1/2 absolute lg:flex items-center dark:bg-mountain-1000 
                            rounded-2xl h-10 text-neutral-700 focus-within:text-mountain-950 dark:focus-within:text-mountain-50 
                            dark:text-neutral-300 -translate-x-1/2 -translate-y-1/2 
                            transition-all duration-300 ease-in-out 
                            ${isFocused ? 'w-108' : 'w-96'}`}
          >
            <FiSearch className="absolute w-5 h-5 -translate-y-1/2 top-1/2 left-2" />
            <Input
              ref={inputRef}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full pl-8 bg-white shadow-inner rounded-2xl"
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
              className={`right-2 text-mountain-600 absolute w-5 h-5 ${inputValue.length <= 0 ? 'hidden' : 'flex'}`}
              onClick={() => {
                setInputValue('');
                setQuery('');
              }}
            />
          </div>
          <div className="flex items-center h-full border-b-4 border-white lg:hidden dark:border-mountain-950">
            <div className="items-center hidden p-2 mt-1 rounded-lg md:flex space-x-1:lg:space-x-2 hover:bg-mountain-100 dark:hover:bg-mountain-1000 text-mountain-500 hover:text-mountain-800 dark:hover:text-mountain-50 hover:cursor-pointer lg">
              <FiSearch className="w-6 h-6" />
              <p className="text-sm">Search</p>
            </div>
          </div>
        </div>
      </div>
      <div className={`flex items-center h-full space-x-2`}>
        <UserButton user={user!} loading={loading!} />
        <UserInAppConfigs />
      </div>
    </nav>
  );
};

export default Header;
