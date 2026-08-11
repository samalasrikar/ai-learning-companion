import React from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

export default function Header() {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/admin/rag')) return 'RAG Store Management';
    if (path.startsWith('/admin/students')) return 'Students';
    if (path.startsWith('/admin/documents')) return 'Admin Documents';
    if (path.startsWith('/admin/chats')) return 'AI Chats';
    if (path.startsWith('/admin/analytics')) return 'System Analytics';
    if (path === '/admin') return 'Admin Dashboard';
    if (path.startsWith('/student/chat') || path === '/chat') return 'AI Chat';
    if (path.startsWith('/student/documents') || path === '/documents') return 'Documents';
    if (path.startsWith('/student/quiz/history')) return 'Quiz History & Analytics';
    if (path.startsWith('/student/quiz') || path === '/quiz') return 'Quiz Generator';
    if (path === '/student') return 'Student Dashboard';
    if (path === '/profile') return 'Profile Settings';
    if (path === '/login') return 'Login';
    if (path === '/register') return 'Register';
    return 'Dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border/40 h-14 flex items-center justify-between px-4 shrink-0 backdrop-blur-md bg-opacity-80">
      {/* Navigation Breadcrumb */}
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
    </header>
  );
}
