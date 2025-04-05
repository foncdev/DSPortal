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
const BlankPage = lazy(() => import('../pages/BlankPage'));

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
            <Route path="/dashboard">
                <Route
                    index
                    element={
                        <AuthLayout requireAuth>
                            <Dashboard />
                        </AuthLayout>
                    }
                />
                <Route
                    path="all"
                    element={
                        <AuthLayout requireAuth requiredRole="admin">
                            <BlankPage />
                        </AuthLayout>
                    }
                />
                <Route
                    path="data-usage"
                    element={
                        <AuthLayout requireAuth>
                            <BlankPage />
                        </AuthLayout>
                    }
                />
                <Route
                    path="device-status"
                    element={
                        <AuthLayout requireAuth>
                            <BlankPage />
                        </AuthLayout>
                    }
                />
                <Route
                    path="logs"
                    element={
                        <AuthLayout requireAuth>
                            <BlankPage />
                        </AuthLayout>
                    }
                />
            </Route>

            {/* Users routes */}
            <Route path="/users">
                <Route
                    index
                    element={
                        <AuthLayout requireAuth>
                            <BlankPage />
                        </AuthLayout>
                    }
                />
                <Route
                    path="admin"
                    element={
                        <AuthLayout requireAuth requiredRole="admin">
                            <BlankPage />
                        </AuthLayout>
                    }
                />
                <Route
                    path="vendors"
                    element={
                        <AuthLayout requireAuth requiredRole="admin">
                            <BlankPage />
                        </AuthLayout>
                    }
                />
                <Route
                    path="regular"
                    element={
                        <AuthLayout requireAuth>
                            <BlankPage />
                        </AuthLayout>
                    }
                />
                <Route
                    path="pending-withdrawal"
                    element={
                        <AuthLayout requireAuth requiredRole="admin">
                            <BlankPage />
                        </AuthLayout>
                    }
                />
                <Route
                    path="inactive"
                    element={
                        <AuthLayout requireAuth requiredRole="admin">
                            <BlankPage />
                        </AuthLayout>
                    }
                />
            </Route>

            {/* Groups routes */}
            <Route path="/groups">
                <Route
                    index
                    element={
                        <AuthLayout requireAuth>
                            <BlankPage />
                        </AuthLayout>
                    }
                />
            </Route>

            {/* Devices routes */}
            <Route path="/devices">
                <Route
                    index
                    element={
                        <AuthLayout requireAuth>
                            <BlankPage />
                        </AuthLayout>
                    }
                />
                <Route
                    path="new"
                    element={
                        <AuthLayout requireAuth requiredRole="admin">
                            <BlankPage />
                        </AuthLayout>
                    }
                />
                <Route
                    path="management"
                    element={
                        <AuthLayout requireAuth>
                            <BlankPage />
                        </AuthLayout>
                    }
                />
                <Route
                    path="list"
                    element={
                        <AuthLayout requireAuth>
                            <BlankPage />
                        </AuthLayout>
                    }
                />
            </Route>

            {/* Files routes */}
            <Route path="/files">
                <Route
                    index
                    element={
                        <AuthLayout requireAuth>
                            <BlankPage />
                        </AuthLayout>
                    }
                />
                <Route
                    path="list"
                    element={
                        <AuthLayout requireAuth>
                            <BlankPage />
                        </AuthLayout>
                    }
                />
                <Route
                    path="deleted"
                    element={
                        <AuthLayout requireAuth>
                            <BlankPage />
                        </AuthLayout>
                    }
                />
            </Route>

            {/* Layouts routes */}
            <Route path="/layouts">
                <Route
                    index
                    element={
                        <AuthLayout requireAuth>
                            <BlankPage />
                        </AuthLayout>
                    }
                />
                <Route
                    path="template"
                    element={
                        <AuthLayout requireAuth>
                            <BlankPage />
                        </AuthLayout>
                    }
                />
                <Route
                    path="list"
                    element={
                        <AuthLayout requireAuth>
                            <BlankPage />
                        </AuthLayout>
                    }
                />
            </Route>

            {/* Deployment route */}
            <Route
                path="/deployment"
                element={
                    <AuthLayout requireAuth>
                        <BlankPage />
                    </AuthLayout>
                }
            />

            {/* Redirect from root to dashboard */}
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