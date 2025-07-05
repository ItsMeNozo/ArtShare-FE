import React from "react";
import background from "/back_ground2_v3.png";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/buttons/LanguageSwitcher";
import { Link, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";

const AuthenLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const params = useLocation();
    const showReturnToLogin = params.pathname === "/forgot-password" || params.pathname === "/email-activation" || location.pathname.includes("auth");
    return (
        <div className="flex justify-center items-center gap-x-4 bg-white dark:bg-mountain-950 shadow-xl w-full h-screen overflow-hidden">
            <div className="hidden md:flex justify-center items-center w-[60%] h-full">
                <img src={background} className="w-full h-full object-cover" />
            </div>
            <div className="flex justify-center items-center w-full md:w-[40%]">
                <div className={`top-5 right-0 w-full md:w-[40%] absolute flex items-center space-x-2 px-10 md:px-1 lg:px-10 xl:px-20 ${showReturnToLogin ? 'justify-between' : 'justify-end'}`}>
                    {
                        showReturnToLogin &&
                        <Link to="/login" className='flex items-center space-x-2 bg-mountain-100 dark:bg-mountain-800 px-4 rounded-2xl h-8 text-mountain-950 dark:text-mountain-50 text-xs lg:text-sm'>
                            <FaArrowLeft className='w-4 h-4'/>
                            <p>Go to Login</p>
                        </Link>
                    }
                    <div className='flex items-center space-x-2'>
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
