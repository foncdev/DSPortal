// app/src/routes/index.tsx
import { lazy, Suspense } from 'react';
import { Navigate, RouteObject, useRoutes } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import SingleLayout from '../layouts/SingleLayout';

// Loading component for suspense fallback
const Loading = () => (
    <div className="h-screen flex items-center justify-center">
        <p>Loading...</p>
    </div>
);

// Page components with lazy loading for code splitting
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const DocumentList = lazy(() => import('../pages/documents/DocumentList'));
const DocumentDetail = lazy(() => import('../pages/documents/DocumentDetail'));
const DocumentCreate = lazy(() => import('../pages/documents/DocumentCreate'));
// const UserList = lazy(() => import('../pages/users/UserList'));
const Settings = lazy(() => import('../pages/settings/Settings'));
const Profile = lazy(() => import('../pages/profile/Profile'));
const Login = lazy(() => import('../pages/auth/Login'));
// const Signup = lazy(() => import('../pages/auth/Signup'));
// const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
// const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));
const Error404 = lazy(() => import('../pages/Error404'));
const Error500 = lazy(() => import('../pages/Error500'));
const Unauthorized = lazy(() => import('../pages/Unauthorized'));
const VendorDashboard = lazy(() => import('../pages/vendor/VendorDashboard'));
const SystemSettings = lazy(() => import('../pages/system/SystemSettings'));

// Define app routes
const AppRoutes = () => {
    const routes: RouteObject[] = [
        // Home page redirect to dashboard
        {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
        },

        // Auth pages (single layout)
        {
            path: '/login',
            element: (
                <SingleLayout withHeader withFooter>
                    <Suspense fallback={<Loading />}>
                        <Login />
                    </Suspense>
                </SingleLayout>
            ),
        },
        // {
        //     path: '/signup',
        //     element: (
        //         <SingleLayout withHeader withFooter>
        //             <Suspense fallback={<Loading />}>
        //                 <Signup />
        //             </Suspense>
        //         </SingleLayout>
        //     ),
        // },
        // {
        //     path: '/forgot-password',
        //     element: (
        //         <SingleLayout withHeader withFooter>
        //             <Suspense fallback={<Loading />}>
        //                 <ForgotPassword />
        //             </Suspense>
        //         </SingleLayout>
        //     ),
        // },
        // {
        //     path: '/reset-password',
        //     element: (
        //         <SingleLayout withHeader withFooter>
        //             <Suspense fallback={<Loading />}>
        //                 <ResetPassword />
        //             </Suspense>
        //         </SingleLayout>
        //     ),
        // },

        // Dashboard (requires user role)
        {
            path: '/dashboard',
            element: (
                <AuthLayout requireAuth requiredRole="user">
                    <Suspense fallback={<Loading />}>
                        <Dashboard />
                    </Suspense>
                </AuthLayout>
            ),
        },

        // Document routes (requires user role)
        {
            path: '/documents',
            element: (
                <AuthLayout requireAuth requiredRole="user">
                    <Suspense fallback={<Loading />}>
                        <DocumentList />
                    </Suspense>
                </AuthLayout>
            ),
        },
        {
            path: '/documents/create',
            element: (
                <AuthLayout requireAuth requiredRole="user">
                    <Suspense fallback={<Loading />}>
                        <DocumentCreate />
                    </Suspense>
                </AuthLayout>
            ),
        },
        {
            path: '/documents/:id',
            element: (
                <AuthLayout requireAuth requiredRole="user">
                    <Suspense fallback={<Loading />}>
                        <DocumentDetail />
                    </Suspense>
                </AuthLayout>
            ),
        },

        // User management (requires admin role)
        // {
        //     path: '/users',
        //     element: (
        //         <AuthLayout requireAuth requiredRole="admin">
        //             <Suspense fallback={<Loading />}>
        //                 <UserList />
        //             </Suspense>
        //         </AuthLayout>
        //     ),
        // },

        // Vendor routes (requires vendor role)
        {
            path: '/vendor',
            element: (
                <AuthLayout requireAuth requiredRole="vendor">
                    <Suspense fallback={<Loading />}>
                        <VendorDashboard />
                    </Suspense>
                </AuthLayout>
            ),
        },

        // System settings (requires super_admin role)
        {
            path: '/system',
            element: (
                <AuthLayout requireAuth requiredRole="super_admin">
                    <Suspense fallback={<Loading />}>
                        <SystemSettings />
                    </Suspense>
                </AuthLayout>
            ),
        },

        // Settings and profile pages (requires user role)
        {
            path: '/settings',
            element: (
                <AuthLayout requireAuth requiredRole="user">
                    <Suspense fallback={<Loading />}>
                        <Settings />
                    </Suspense>
                </AuthLayout>
            ),
        },
        {
            path: '/profile',
            element: (
                <AuthLayout requireAuth requiredRole="user">
                    <Suspense fallback={<Loading />}>
                        <Profile />
                    </Suspense>
                </AuthLayout>
            ),
        },

        // Error pages
        {
            path: '/unauthorized',
            element: (
                <SingleLayout>
                    <Suspense fallback={<Loading />}>
                        <Unauthorized />
                    </Suspense>
                </SingleLayout>
            ),
        },
        {
            path: '/server-error',
            element: (
                <SingleLayout>
                    <Suspense fallback={<Loading />}>
                        <Error500 />
                    </Suspense>
                </SingleLayout>
            ),
        },

        // 404 - Catch all route
        {
            path: '*',
            element: (
                <SingleLayout>
                    <Suspense fallback={<Loading />}>
                        <Error404 />
                    </Suspense>
                </SingleLayout>
            ),
        },
    ];

    return useRoutes(routes);
};

export default AppRoutes;