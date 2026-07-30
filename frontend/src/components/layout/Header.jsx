import React from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

export default function Header() {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/chat':
        return 'AI Chat';
      case '/documents':
        return 'Documents';
      case '/quiz':
        return 'Quiz Generator';
      case '/analytics':
        return 'Analytics';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border/40 h-14 flex items-center justify-between px-4 shrink-0 backdrop-blur-md bg-opacity-80">
      {/* Left side: Sidebar Toggle & Navigation Breadcrumb */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs font-semibold text-muted-foreground">
                {getPageTitle()}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right side: Search & Notifications */}
      <div className="flex items-center gap-4">
        <div className="hidden md:block w-64">
          <SearchBar placeholder="Search knowledge..." />
        </div>
        <button className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full relative transition-colors">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
