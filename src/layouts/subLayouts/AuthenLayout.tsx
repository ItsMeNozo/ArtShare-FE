import { LanguageSwitcher } from '@/components/buttons/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa6';
import { Link, useLocation } from 'react-router-dom';

const background = 'https://res.cloudinary.com/dqxtf297o/image/upload/v1753613952/artshare-asset/back_ground_dqa1at.png'
const appLogo = 'https://res.cloudinary.com/dqxtf297o/image/upload/v1753614058/artshare-asset/logo_app_v_101_hiw6ok.png'

function HeroImage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const blurred = background.replace('/upload/', '/upload/w_20,e_blur:2000,q_1/');

  return (
    <div className="hidden z-10 relative md:flex justify-center items-center w-[60%] h-full overflow-hidden shrink-0">
      {/* Blurred placeholder */}
      <img
        src={blurred}
        className={`absolute w-full h-full object-cover blur-2xl scale-105 transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
        alt="blur-placeholder"
        aria-hidden
      />
      {/* Main image */}
      <img
        src={background}
        onLoad={() => setIsLoaded(true)}
        className="shadow-xl rounded-lg w-full h-full object-cover transition-opacity duration-700"
        alt="Main visual"
        draggable={false}
      />
      {/* App Logo */}
      <div className='top-2 right-2 absolute flex flex-col justify-center items-center space-y-1 select-none'>
        <img src={appLogo} className="w-10 h-10 object-cover pointer-events-none select-none" alt="Logo" />
        <p className='font-bold text-white'>Art Share</p>
      </div>
      {/* Caption Text */}
      <div className='top-1/2 right-2 xl:right-4 z-50 absolute flex flex-col justify-center items-center space-y-4 text-white text-sm -translate-y-1/2 select-none'>
        <p className='w-full font-bold text-xl xl:text-3xl text-right'>CREATE</p>
        <p className='w-full font-bold text-[#6BFDCD] text-xl xl:text-3xl text-right'>SHARE</p>
        <p className='w-full font-bold text-[#fdde71] text-xl xl:text-3xl text-right'>INSPIRE</p>
        <p className='w-full font-bold text-[#e6ecf1] text-xl xl:text-3xl text-right'>AUTOMATE</p>
      </div>
    </div>
  );
}

const AuthenLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const params = useLocation();
  const showReturnToLogin =
    params.pathname === '/forgot-password' ||
    params.pathname === '/email-activation' ||
    location.pathname.includes('auth');
  return (
    <div className="relative flex justify-center items-center gap-x-4 bg-white dark:bg-mountain-950 shadow-xl p-6 w-full h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="bottom-0 left-0 z-0 absolute bg-gradient-to-t from-indigo-400/30 via-indigo-200/20 to-transparent backdrop-blur-2xl blur-2xl w-full h-40 pointer-events-none"
      />
      <HeroImage />
      <div className="z-10 flex flex-col justify-start px-20 w-full md:w-[40%] h-full shrink-0">
        <div className={`flex w-full items-center justify-end space-x-2 ${showReturnToLogin ? 'justify-between' : 'justify-end'}`}>
          {showReturnToLogin && (
            <Link
              to="/login"
              className="flex items-center space-x-2 bg-mountain-100 dark:bg-mountain-800 px-4 rounded-2xl h-8 text-mountain-950 dark:text-mountain-50 text-xs lg:text-sm"
            >
              <FaArrowLeft className="w-4 h-4" />
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
