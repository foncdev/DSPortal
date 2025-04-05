// app/src/pages/auth/ForgotPassword.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authManager } from '@ds/core';
import styles from './Auth.module.scss';
import forgotStyles from './ForgotPassword.module.scss';

const ForgotPassword: React.FC = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!email) {
            setError(t('auth.emailRequired'));
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError(t('auth.invalidEmail'));
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Call the password reset function from authManager
            await authManager.resetPassword({ email });

            // Show success message
            setIsSubmitted(true);
        } catch (err: any) {
            console.error('Password reset error:', err);
            setError(err.message || t('auth.resetPasswordFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.authPage}>
            {!isSubmitted ? (
                <>
                    <div className={styles.authHeader}>
                        <h1>{t('auth.forgotPassword')}</h1>
                        <p>{t('auth.forgotPasswordDescription')}</p>
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
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className={styles.spinner}></span>
                            ) : null}
                            {t('auth.sendResetLink')}
                        </button>
                    </form>

                    <div className={forgotStyles.backToLoginWrapper}>
                        <Link to="/login" className={forgotStyles.backToLogin}>
                            <ArrowLeft size={16} />
                            <span>{t('auth.backToLogin')}</span>
                        </Link>
                    </div>
                </>
            ) : (
                <div className={forgotStyles.successContainer}>
                    <div className={forgotStyles.successIcon}>
                        <CheckCircle size={48} />
                    </div>
                    <h2 className={forgotStyles.successTitle}>{t('auth.resetLinkSent')}</h2>
                    <p className={forgotStyles.successMessage}>
                        {t('auth.resetLinkSentMessage', { email })}
                    </p>
                    <div className={forgotStyles.actions}>
                        <Link to="/login" className={forgotStyles.loginButton}>
                            {t('auth.backToLogin')}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;