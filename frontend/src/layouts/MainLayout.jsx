import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { LayoutDashboard, MessageSquare, GraduationCap } from "lucide-react";

export default function MainLayout() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'AI Chat', path: '/chat', icon: MessageSquare },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 w-full text-left">
        {/* Sidebar Component */}
        <Sidebar className="border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-zinc-200 dark:border-zinc-800">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              <GraduationCap className="h-6 w-6 text-violet-600" />
              <span>StudyCompanion</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent className="mt-2">
                <SidebarMenu>
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                          <Link
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400'
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-50'
                            }`}
                          >
                            <Icon className={`h-4 w-4 ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-zinc-500'}`} />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 px-2 py-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs text-zinc-500 font-medium">Online Mode</span>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center px-4 justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400" />
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {location.pathname === '/chat' ? 'AI Chatroom' : 'Dashboard'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2 py-1 bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 font-medium rounded-full">
                Beta v1.0
              </span>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
