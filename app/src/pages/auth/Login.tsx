import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, Mail, Lock } from 'lucide-react';
import { authManager } from '@ds/core';
import styles from './Auth.module.scss';

const Login: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    // Get redirect path from location state or default to dashboard
    const from = (location.state as any)?.from?.pathname || '/dashboard';

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Authenticate user
            await authManager.login({
                email,
                password,
                rememberMe
            });

            // Redirect to dashboard or previous page
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || t('auth.loginFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.authHeader}>
                <h1>{t('auth.login')}</h1>
                <p>{t('auth.loginDescription')}</p>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            <form className={styles.authForm} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.formLabel}>
                        {t('auth.email')}
                    </label>
                    <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>
              <Mail size={18} />
            </span>
                        <input
                            id="email"
                            type="email"
                            className={styles.formControl}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@company.com"
                            required
                            autoFocus
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <div className={styles.passwordHeader}>
                        <label htmlFor="password" className={styles.formLabel}>
                            {t('auth.password')}
                        </label>
                        <Link to="/forgot-password" className={styles.forgotPassword}>
                            {t('auth.forgotPassword')}
                        </Link>
                    </div>
                    <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>
              <Lock size={18} />
            </span>
                        <input
                            id="password"
                            type="password"
                            className={styles.formControl}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <div className={styles.formCheck}>
                    <input
                        id="remember-me"
                        type="checkbox"
                        className={styles.formCheckInput}
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="remember-me" className={styles.formCheckLabel}>
                        {t('auth.rememberMe')}
                    </label>
                </div>

                <button
                    type="submit"
                    className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className={styles.spinner}></span>
                    ) : (
                        <LogIn size={18} className={styles.buttonIcon} />
                    )}
                    {t('auth.login')}
                </button>
            </form>

            <div className={styles.authFooter}>
                <p>
                    {t('auth.noAccount')} <Link to="/signup">{t('auth.signup')}</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;