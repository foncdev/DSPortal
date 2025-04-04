// app/src/routes/index.tsx
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import SingleLayout from '../layouts/SingleLayout';

// Loading spinner component
const Loading = () => (
    <div className="flex h-screen items-center justify-center">
        <div className="text-center">
            <div className="spinner"></div>
            <p>Loading...</p>
        </div>
    </div>
);

// Lazy loaded components for code splitting
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Login = lazy(() => import('../pages/auth/Login'));
const Error404 = lazy(() => import('../pages/Error404'));
const Error500 = lazy(() => import('../pages/Error500'));
const Unauthorized = lazy(() => import('../pages/Unauthorized'));

const AppRoutes: React.FC = () => (
        <Suspense fallback={<Loading />}>
            <Routes>
                {/* Auth Routes - Single Layout */}
                <Route
                    path="/login"
                    element={
                        <SingleLayout withHeader withFooter>
                            <Login />
                        </SingleLayout>
                    }
                />

                {/* Error Pages - Single Layout */}
                <Route
                    path="/unauthorized"
                    element={
                        <SingleLayout>
                            <Unauthorized />
                        </SingleLayout>
                    }
                />
                <Route
                    path="/server-error"
                    element={
                        <SingleLayout>
                            <Error500 />
                        </SingleLayout>
                    }
                />

                {/* Auth Protected Routes - Auth Layout */}
                <Route
                    path="/"
                    element={
                        <AuthLayout requireAuth>
                            <Dashboard />
                        </AuthLayout>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <AuthLayout requireAuth>
                            <Dashboard />
                        </AuthLayout>
                    }
                />

                {/* Redirect Routes */}
                <Route path="/" element={<Navigate to="/dashboard" />} />

                {/* Catch-all route - 404 */}
                <Route
                    path="*"
                    element={
                        <SingleLayout>
                            <Error404 />
                        </SingleLayout>
                    }
                />
            </Routes>
        </Suspense>
    );

export default AppRoutes;