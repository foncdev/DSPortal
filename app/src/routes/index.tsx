// app/src/routes/index.tsx - Updated with new auth routes
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
const SignUp = lazy(() => import('../pages/auth/SignUp'));
const SignUpSuccess = lazy(() => import('../pages/auth/SignUpSuccess'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));
const Terms = lazy(() => import('../pages/Terms'));
const Error404 = lazy(() => import('../pages/Error404'));
const Error500 = lazy(() => import('../pages/Error500'));
const Unauthorized = lazy(() => import('../pages/Unauthorized'));
const BlankPage = lazy(() => import('../pages/BlankPage'));
const ComponentsDemo = lazy(() => import('../pages/ComponentsDemo')); // 추가: UI 컴포넌트 데모 페이지


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
            <Route
                path="/signup"
                element={
                    <SingleLayout withHeader withFooter>
                        <SignUp />
                    </SingleLayout>
                }
            />
            <Route
                path="/signup/success"
                element={
                    <SingleLayout withHeader withFooter>
                        <SignUpSuccess />
                    </SingleLayout>
                }
            />
            <Route
                path="/forgot-password"
                element={
                    <SingleLayout withHeader withFooter>
                        <ForgotPassword />
                    </SingleLayout>
                }
            />
            <Route
                path="/reset-password"
                element={
                    <SingleLayout withHeader withFooter>
                        <ResetPassword />
                    </SingleLayout>
                }
            />
            <Route
                path="/terms"
                element={
                    <SingleLayout withHeader withFooter>
                        <Terms />
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
            <Route path="/dashboard">
                <Route
                    index
                    element={
                        <AuthLayout requireAuth>
                            <Dashboard />
                        </AuthLayout>
                    }
                />
                {/* Other dashboard routes */}
                <Route
                    path="all"
                    element={
                        <AuthLayout requireAuth requiredRole="admin">
                            <BlankPage />
                        </AuthLayout>
                    }
                />
                {/* ... additional routes ... */}
            </Route>

            {/* ... other routes ... */}

            {/* Redirect from root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" />} />

            <Route
                path="/components"
                element={
                    <ComponentsDemo />
                }
            />

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