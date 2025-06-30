import Header from '@/components/header/app-header';
import Sidebar from '@/components/sidebar/app-sidebar';
import React, { useState } from 'react';

const InAppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expandSideBar, setExpandSideBar] = useState(true);
  return (
    <div className={`relative flex h-screen min-h-0 w-full flex-row`}>
      <Sidebar expand={expandSideBar} setExpand={setExpandSideBar} />
      <div
        className={`z-50 flex h-full min-h-0 w-[calc(100vw-16rem)] flex-1 flex-col px-2`}
      >
        <Header />
        <div className="dark:bg-mountain-1000 min-h-0 flex-1 rounded-t-3xl bg-white shadow-[-4px_-4px_16px_rgba(0,0,0,0.12)] transition-shadow duration-300">
          {children}
        </div>
      </div>
    </div>
  );
};

export default InAppLayout;
