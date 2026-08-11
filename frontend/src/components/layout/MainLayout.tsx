import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { OfflineBanner } from '../pwa/OfflineBanner';
import { PwaInstallPrompt } from '../pwa/PwaInstallPrompt';
import { PwaUpdatePrompt } from '../pwa/PwaUpdatePrompt';
import { AnimatedPageWrapper } from '../shared/AnimatedPageWrapper';

export const MainLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-foreground flex flex-col font-sans">
      <OfflineBanner />
      <PwaUpdatePrompt />
      <PwaInstallPrompt />

      <div className="flex-1 flex relative">
        {/* Enterprise Collapsible Sidebar (Permanently Mounted & Stable) */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Main Content Area (Smooth Margin Shift & Zero Layout Flicker) */}
        <div
          className={`flex-1 flex flex-col min-h-screen min-w-0 w-full max-w-full overflow-x-hidden transition-all duration-250 ease-in-out ${
            isSidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[280px]'
          }`}
        >
          <Header
            onToggleSidebar={() => {
              if (window.innerWidth < 1024) {
                setIsMobileOpen((prev) => !prev);
              } else {
                setIsSidebarCollapsed((prev) => !prev);
              }
            }}
          />
          <main className="flex-1 p-3 sm:p-4 lg:p-5 max-w-[1600px] w-full min-w-0 mx-auto space-y-3.5 overflow-x-hidden">
            <AnimatedPageWrapper key={location.pathname}>
              <Outlet />
            </AnimatedPageWrapper>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};
