import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumb } from './Breadcrumb';
import { Footer } from './Footer';
import { OfflineBanner } from '../pwa/OfflineBanner';
import { PwaInstallPrompt } from '../pwa/PwaInstallPrompt';
import { PwaUpdatePrompt } from '../pwa/PwaUpdatePrompt';

export const MainLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <OfflineBanner />
      <PwaUpdatePrompt />
      <PwaInstallPrompt />
      
      <div className="flex-1 flex">
        {/* Collapsible Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          }`}
        >
          <Header onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            <Breadcrumb />
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};
