import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * PublicLayout renders public pages (Landing Page, Login)
 * with no dashboard sidebar navigation.
 */
export default function PublicLayout() {
  return (
    <div className="min-h-screen w-full bg-background font-sans">
      <Outlet />
    </div>
  );
}
