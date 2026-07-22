import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export default function MainLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full text-left font-sans">
        {/* Sidebar Navigation */}
        <AppSidebar />

        {/* Workspace Area */}
        <div className="flex-grow flex flex-col min-h-screen min-w-0">
          <Header />
          <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
