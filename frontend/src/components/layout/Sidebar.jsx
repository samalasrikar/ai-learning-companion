import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Award,
  Milestone,
  BarChart2,
  Settings,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import logo from '@/assets/logo.png';

const menuItems = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'AI Chat', path: '/chat', icon: MessageSquare },
  { title: 'Documents', path: '/documents', icon: FileText },
  { title: 'Quiz Generator', path: '/quiz', icon: Award },
  { title: 'Learning Roadmap', path: '/roadmap', icon: Milestone },
  { title: 'Analytics', path: '/analytics', icon: BarChart2 },
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-border/40 bg-card">
      {/* Sidebar Header */}
      <SidebarHeader className="px-4 py-5 flex flex-col items-center justify-center gap-1.5">
        <img src={logo} alt="Learning Companion Logo" className="h-16 w-16 shrink-0 rounded-xl shadow-sm border border-border/40" />
        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
          AI Assistant
        </span>
      </SidebarHeader>

      {/* Sidebar Navigation Options */}
      <SidebarContent className="px-2 py-1 flex flex-col justify-between h-full">
        <SidebarMenu className="space-y-0.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={`w-full flex items-center gap-2.5 h-10 px-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-container/10 text-primary font-bold border-l-4 border-primary rounded-l-none'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Link to={item.path} className="flex items-center gap-2.5 w-full h-full">
                    <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-xs font-semibold">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        {/* Settings button above footer */}
        <SidebarMenu className="mt-auto border-t border-border/40 pt-3">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="w-full flex items-center gap-2.5 h-10 px-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Link to="/" className="flex items-center gap-2.5 w-full h-full">
                <Settings className="h-4.5 w-4.5" />
                <span className="text-xs font-semibold">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      {/* Sidebar Profile Card Footer */}
      <SidebarFooter className="p-2 border-t border-border/40">
        <div className="flex items-center gap-2 p-1.5 bg-muted/40 border border-border/40 rounded-xl w-full overflow-hidden">
          <Avatar className="h-8 w-8 border border-border/40 shrink-0">
            <AvatarImage
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCF-FjePx5w_71l8bHjPfLg4nhCKYmrwp6v5O81naFBfZDn1HVx7uX22px51w2lTW4n-UhvTxSLC8yxtlbX7zsCszycwjlPOJas9Dq1daHHynpzBxvDJL_VYmWIzHLIetWQvnWwIyZZaP48_5sI5NXqRB1ir_up2o_UPE5s6YhQzLlgrKflsu0uLvlIBKrMhQ4xXCRMaVilj1FQzbj6SSwh9GsqYa9Rschbw-_uWUypA4YkjU4UsK93l4dJozDunKRMSbaJ7p9ckrA"
              alt="Alex Chen Profile Picture"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              AC
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-xs font-bold text-foreground truncate">Alex Chen</p>
            <p className="text-[10px] text-muted-foreground truncate font-medium">Pro Plan Active</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
