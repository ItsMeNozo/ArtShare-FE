// Core Lib/Frameworks
import React from "react";

// Components
import AIHeader from "@/components/header/ai-app-header";

const AILayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className={`flex flex-row w-full h-full`}>
      <div className="flex flex-col w-full h-full">
        <AIHeader />
        <div className={`border-l-1 bg-mountain-50 border-l-mountain-100 dark:border-l-mountain-700 h-full w-[calc(100vw]`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AILayout;
