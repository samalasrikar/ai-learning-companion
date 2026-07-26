import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';

import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Dashboard from '../pages/Dashboard';
import Chat from '../pages/Chat';
import Documents from '../pages/Documents';
import QuizGenerator from '../pages/QuizGenerator';
import LearningRoadmap from '../pages/LearningRoadmap';
import Analytics from '../pages/Analytics';
import AdminDashboard from '../pages/AdminDashboard';
import AdminStudents from '../pages/AdminStudents';
import AdminDocuments from '../pages/AdminDocuments';
import AdminChats from '../pages/AdminChats';
import Settings from '../pages/Settings';
import ActivityLogs from '../pages/ActivityLogs';
import SystemStatus from '../pages/SystemStatus';

import AdminRagManagement from '../pages/AdminRagManagement';

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/rag" element={<AdminRagManagement />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/documents" element={<AdminDocuments />} />
            <Route path="/admin/chats" element={<AdminChats />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/activity-logs" element={<ActivityLogs />} />
            <Route path="/admin/system-status" element={<SystemStatus />} />
          </Route>
        </Route>

        {/* Protected Student & Shared Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Student', 'Admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/student" element={<Dashboard />} />
            <Route path="/student/chat" element={<Chat />} />
            <Route path="/student/documents" element={<Documents />} />
            <Route path="/student/quiz" element={<QuizGenerator />} />
            <Route path="/student/roadmap" element={<LearningRoadmap />} />
            <Route path="/student/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />

            {/* Direct aliases */}
            <Route path="/chat" element={<Navigate to="/student/chat" replace />} />
            <Route path="/documents" element={<Navigate to="/student/documents" replace />} />
            <Route path="/quiz" element={<Navigate to="/student/quiz" replace />} />
            <Route path="/roadmap" element={<Navigate to="/student/roadmap" replace />} />
            <Route path="/analytics" element={<Navigate to="/student/analytics" replace />} />
          </Route>
        </Route>

        {/* Fallback Redirects */}
        <Route path="/landing" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
