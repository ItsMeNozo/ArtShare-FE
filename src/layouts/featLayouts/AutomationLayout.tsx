// Core Lib/Frameworks
import React from "react";

// Components
import AutoPostHeader from "@/components/header/auto-app-header";

const AutomationLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className={`flex flex-row w-full h-full`}>
            <div className="flex flex-col w-full h-full">
                <AutoPostHeader />
                <div className={`border-l-1 p-4 bg-mountain-50 border-l-mountain-100 dark:border-l-mountain-700 h-screen w-[calc(100vw]`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AutomationLayout;
