import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guard component protecting authenticated routes and checking role authorizations.
 * 
 * @param {Object} props
 * @param {Array<string>} [props.allowedRoles] - Optional array of allowed roles (e.g., ['Admin']).
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Role-based unauthorized fallback
    if (user?.role === 'Student') {
      return <Navigate to="/student" replace />;
    }
    if (user?.role === 'Admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
