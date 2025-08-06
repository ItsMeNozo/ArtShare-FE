import { useEffect, useState } from "react";
import { AuroraBackground } from "./AuroraBackground";
import { FaDesktop, FaYoutube } from "react-icons/fa";

const logo = 'https://res.cloudinary.com/dqxtf297o/image/upload/v1753614058/artshare-asset/logo_app_v_101_hiw6ok.png'

export default function MobileBlocker({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Example: block below 1024px
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    return (
      <AuroraBackground className="flex justify-center items-center p-4 h-screen">
        <div className="top-4 left-1/2 absolute flex justify-between gap-2 xs:gap-4 bg-white/50 p-2 border border-mountain-200 rounded-full w-80 xs:w-96 -translate-x-1/2 shrink-0">
          <a href="https://artshare-home.vercel.app/" target="_self" className="flex items-center px-4 py-2 border border-mountain-200 rounded-full font-medium text-gray-800">
            <span className="text-sm xs:text-base text-nowrap">Landing Page</span>
          </a>
          <a href="https://artshare-docs.vercel.app/" target="_self" className="flex items-center px-2 xs:px-4 py-2 border border-mountain-200 rounded-full font-medium text-gray-800">
            <span className="text-sm xs:text-base">Documentation</span>
          </a>
          <a href="https://www.youtube.com/@artshareofficial" target="_self" className="flex items-center px-4 py-2 border border-mountain-200 rounded-full font-medium text-gray-800">
            <FaYoutube className="size-4 xs:size-6 text-red-600" />
          </a>
        </div>
        <div className="bottom-4 left-1/2 absolute flex justify-between gap-4 bg-white/50 p-2 border border-mountain-200 rounded-full w-80 sm:w-96 -translate-x-1/2 shrink-0">
          <div className="flex items-center px-4 py-0.5 font-medium text-gray-800">
            <img src={logo} alt="ArtShare Logo" className="mr-2 w-auto h-6 xs:h-8" />
            <span className="text-sm xs:text-base">ArtShare</span>
          </div>
          <div className="flex items-center px-4 py-0.5">
            <div className="text-mountain-600 text-sm sm:text-base text-nowrap">
              © {new Date().getFullYear()} - All rights reserved
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center space-y-2 bg-white p-8 rounded-lg">
          <div className="flex items-center space-x-4">
            <FaDesktop className="size-6" />
            <h1 className="font-medium text-xl sm:text-2xl">Desktop Browser Only</h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base text-center">
            Please open ArtShare on a desktop browser for the best experience.
          </p>
        </div>
      </AuroraBackground>
    );
  }

  return <>{children}</>;
}
