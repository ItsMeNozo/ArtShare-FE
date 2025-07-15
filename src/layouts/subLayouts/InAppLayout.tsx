import Header from '@/components/header/app-header';
import Sidebar from '@/components/sidebar/app-sidebar';
import React, { useState } from 'react';

const InAppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expandSidebar, setExpandSidebar] = useState(true);
  return (
    <div className={`relative flex h-screen min-h-0 w-full flex-row`}>
      <Sidebar expand={expandSidebar} setExpand={setExpandSidebar} />
      <div
        className={`z-50 flex h-full min-h-0 w-[calc(100vw-16rem)] flex-1 flex-col`}
      >
        <Header />
        <div className="flex-1 bg-gradient-to-b from-mountain-100/80 dark:from-mountain-1000 to-white dark:to-mountain-900 border border-mountain-100 dark:border-black rounded-t-3xl transition-shadow duration-300">
          {children}
        </div>
      </div>
    </div>
  );
};

export default InAppLayout;
