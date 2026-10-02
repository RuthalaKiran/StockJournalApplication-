import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Bot,
  X,
  PlusCircle,
} from 'lucide-react';

export const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Journals',
      path: '/journals',
      icon: BookOpen,
      badge: null,
    },
    {
      name: 'Calendar',
      path: '/calendar',
      icon: Calendar,
      badge: null,
    },
    {
      name: 'AI Coach',
      path: '/coach',
      icon: Bot,
      badge: 'AI',
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Navigation Links */}
      <div className="space-y-6">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between pb-4 border-b border-gray-200 dark:border-[#1f293d]">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Navigation
          </span>
          <button
            onClick={onMobileClose}
            className="p-1 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close navigation drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Navigation Menu */}
        <nav className="space-y-1.5" aria-label="Main sidebar navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/40'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                        isActive
                          ? 'text-cyan-600 dark:text-cyan-400'
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                      }`}
                    />
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase transition-colors ${
                          isActive
                            ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-black font-extrabold shadow-sm'
                            : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/60'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Quick Trade Action Card at Bottom of Sidebar */}
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-[#1f293d]/60">
        <NavLink
          to="/journals/new"
          onClick={onMobileClose}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-gray-100 dark:bg-gray-800/50 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 hover:border-cyan-200 dark:hover:border-cyan-500/30 border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-400 text-xs font-semibold uppercase tracking-wider transition-all"
        >
          <PlusCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Record Trade</span>
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#0a0e17] border-r border-gray-200 dark:border-[#1f293d] p-4 shrink-0 h-full overflow-y-auto transition-colors">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[82vw] bg-white dark:bg-[#0d121f] p-4 sm:p-5 shadow-2xl border-r border-gray-200 dark:border-[#1f293d] z-50 animate-in slide-in-from-left duration-200 overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
