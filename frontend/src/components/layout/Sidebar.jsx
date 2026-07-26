import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  User,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  ShieldAlert,
  Activity,
  Database,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { APP_NAME } from '@/constants/app.constants';
import { useAuth, getAvatarUrl } from '@/context/AuthContext';
import logo from '@/assets/logo.png';

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const adminMenuItems = [
    { title: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { title: 'RAG Store', path: '/admin/rag', icon: Database },
    { title: 'Students', path: '/admin/students', icon: Users },
    { title: 'Documents', path: '/admin/documents', icon: FileText },
    { title: 'AI Chats', path: '/admin/chats', icon: MessageSquare },
    { title: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { title: 'Settings', path: '/admin/settings', icon: SettingsIcon },
    { title: 'Activity Logs', path: '/admin/activity-logs', icon: ShieldAlert },
    { title: 'System Status', path: '/admin/system-status', icon: Activity },
  ];

  const studentMenuItems = [
    { title: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { title: 'AI Chat', path: '/student/chat', icon: MessageSquare },
    { title: 'Documents', path: '/student/documents', icon: FileText },
    { title: 'Quiz Generator', path: '/student/quiz', icon: Award },
  ];

  const menuItems = role === 'Admin' ? adminMenuItems : studentMenuItems;

  return (
    <Sidebar className="w-60 h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between select-none">
      {/* Sidebar Top Header: Logo & Title */}
      <SidebarHeader className="px-4 py-4 flex flex-col items-center justify-center text-center shrink-0">
        <Link to="/" className="flex flex-col items-center group">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-50 dark:bg-slate-800 transition-transform duration-200 group-hover:scale-105">
            <img src={logo} alt={`${APP_NAME} Logo`} className="w-14 h-14 object-contain" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-2.5">
            {APP_NAME}
          </span>
        </Link>
      </SidebarHeader>

      {/* Navigation Links Area (Scrollable flex-1) */}
      <SidebarContent className="px-3 py-2 flex flex-col flex-1 overflow-y-auto custom-scrollbar">
        <SidebarMenu className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={`w-full flex items-center gap-3 h-10 px-3.5 rounded-xl transition-all duration-200 text-xs font-medium ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Link to={item.path} className="flex items-center gap-3 w-full h-full">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Pinned Bottom User Profile & Action Bar */}
      <SidebarFooter className="mt-auto p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/80 shrink-0">
        <div className="flex flex-col gap-2 p-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          {/* User Details Box */}
          <div className="flex items-center gap-2.5">
            <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs">
              {user?.avatar ? (
                <AvatarImage src={getAvatarUrl(user.avatar)} alt="User Avatar" />
              ) : null}
              <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xs">
                {user?.firstName ? user.firstName[0] : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">
                {user ? `${user.firstName} ${user.lastName}` : 'User Account'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate capitalize font-semibold">
                {user?.role || 'Student'} Account
              </p>
            </div>
          </div>

          {/* Quick Actions: Profile Link & Logout Button */}
          <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/profile"
              className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-[11px] font-semibold transition-colors"
              title="Profile Settings"
            >
              <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Profile</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center h-8 px-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl text-[11px] font-semibold transition-colors"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
