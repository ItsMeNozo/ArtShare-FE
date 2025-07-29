import Header from '@/components/header/app-header';
import AutoSidebar from '@/components/sidebar/auto-sidebar';
import TopProgressBar from '@/components/TopProgressBar';
import React, { useState } from 'react';

const AutoLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expandSidebar, setExpandSidebar] = useState(true);
  return (
    <div className={`relative flex h-screen min-h-0 w-full flex-row`}>
      <AutoSidebar expand={expandSidebar} setExpand={setExpandSidebar} />
      <div
        className={`z-50 flex h-full min-h-0 w-[calc(100vw-16rem)] flex-1 flex-col`}
      >
        <TopProgressBar />
        <Header />
        <div className="flex-1 bg-[#F2F4F7] dark:from-mountain-1000 dark:to-mountain-900 border border-mountain-100 dark:border-black rounded-t-3xl transition-shadow duration-300">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AutoLayout;
