// app/src/routes/PrivateRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authManager } from '@ds/core';

interface PrivateRouteProps {
    children: React.ReactNode;
    requiredRole?: 'user' | 'vendor' | 'admin' | 'super_admin';
}

/**
 * Route component that redirects to login page if user is not authenticated
 * or to unauthorized page if user doesn't have required role
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({
                                                       children,
                                                       requiredRole = 'user'
                                                   }) => {
    const location = useLocation();
    const isAuthenticated = authManager.isAuthenticated();

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based permissions if a specific role is required
    if (requiredRole) {
        const hasPermission = authManager.hasRole(requiredRole);

        if (!hasPermission) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // User is authenticated and has proper permissions
    return <>{children}</>;
};

export default PrivateRoute;