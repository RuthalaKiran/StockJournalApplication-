import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-[100dvh] flex flex-col bg-gray-50 dark:bg-[#0a0e17] text-gray-900 dark:text-gray-100 transition-colors overflow-hidden">
      <Navbar onMobileMenuToggle={() => setMobileMenuOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
