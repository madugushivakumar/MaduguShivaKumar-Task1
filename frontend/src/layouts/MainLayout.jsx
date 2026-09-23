import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';

export const MainLayout = () => {
  const location = useLocation();

  // Auth pages and Landing Page render in full-width canvas
  const isFullWidthPage =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register';

  if (isFullWidthPage) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] text-[#172033] antialiased font-sans selection:bg-[#1557D6] selection:text-white">
        <Outlet />
      </div>
    );
  }

  // All internal application views use the reference AppShell
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};

export default MainLayout;
