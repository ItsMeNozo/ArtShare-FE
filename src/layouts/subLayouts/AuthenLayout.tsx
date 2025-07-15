import { LanguageSwitcher } from '@/components/buttons/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import React from 'react';
import { FaArrowLeft } from 'react-icons/fa6';
import { Link, useLocation } from 'react-router-dom';
import background from '/back_ground2_v3.png';

const AuthenLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const params = useLocation();
  const showReturnToLogin =
    params.pathname === '/forgot-password' ||
    params.pathname === '/email-activation' ||
    location.pathname.includes('auth');
  return (
    <div className="dark:bg-mountain-950 flex h-screen w-full items-center justify-center gap-x-4 overflow-hidden bg-white shadow-xl">
      <div className="hidden h-full w-[60%] items-center justify-center md:flex">
        <img src={background} className="h-full w-full object-cover" />
      </div>
      <div className="flex w-full items-center justify-center md:w-[40%]">
        <div
          className={`absolute top-5 right-0 flex w-full items-center space-x-2 px-10 md:w-[40%] md:px-1 lg:px-10 xl:px-20 ${showReturnToLogin ? 'justify-between' : 'justify-end'}`}
        >
          {showReturnToLogin && (
            <Link
              to="/login"
              className="bg-mountain-100 dark:bg-mountain-800 text-mountain-950 dark:text-mountain-50 flex h-8 items-center space-x-2 rounded-2xl px-4 text-xs lg:text-sm"
            >
              <FaArrowLeft className="h-4 w-4" />
              <p>Go to Login</p>
            </Link>
          )}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthenLayout;
