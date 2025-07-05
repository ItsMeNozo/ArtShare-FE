// Core Lib/Frameworks
import React from 'react';

// Components
import AutoPostHeader from '@/components/header/auto-app-header';

const AutomationLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className={`flex h-full w-full flex-row`}>
      <div className="flex h-full w-full flex-col">
        <AutoPostHeader />
        <div
          className={`bg-mountain-50 border-l-mountain-100 dark:border-l-mountain-700 h-screen w-[calc(100vw] border-l-1 p-4`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default AutomationLayout;
