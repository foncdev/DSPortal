// app/src/pages/auth/ResetPassword.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './Auth.module.scss';
import resetStyles from './ResetPassword.module.scss';

const ResetPassword: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Get token from URL
    const token = searchParams.get('token');

    // Form state
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | ''>('');
    const [passwordMatch, setPasswordMatch] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);
    const [tokenChecking, setTokenChecking] = useState(true);

    // Check if token is valid on component mount
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setTokenValid(false);
                setTokenChecking(false);
                return;
            }

            try {
                // Simulate API call to validate token
                await new Promise(resolve => setTimeout(resolve, 1000));

                // For this demo, we'll assume tokens that are at least 10 chars are valid
                // In a real app, you'd call an API endpoint to validate
                if (token.length >= 10) {
                    setTokenValid(true);
                } else {
                    setTokenValid(false);
                }
            } catch (err) {
                setTokenValid(false);
            } finally {
                setTokenChecking(false);
            }
        };

        validateToken();
    }, [token]);

    // Check password strength
    const checkPasswordStrength = useCallback((pwd: string) => {
        if (!pwd) {
            setPasswordStrength('');
            return;
        }

        // Simple password strength check
        const hasLowerCase = /[a-z]/.test(pwd);
        const hasUpperCase = /[A-Z]/.test(pwd);
        const hasNumber = /\d/.test(pwd);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
        const isLongEnough = pwd.length >= 8;

        const score = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar, isLongEnough].filter(Boolean).length;

        if (score <= 2) setPasswordStrength('weak');
        else if (score <= 4) setPasswordStrength('medium');
        else setPasswordStrength('strong');

        // Also check if passwords match
        if (confirmPassword) {
            setPasswordMatch(pwd === confirmPassword);
        }
    }, [confirmPassword]);

    // Check if passwords match
    const checkPasswordsMatch = useCallback(() => {
        if (!password || !confirmPassword) return;
        setPasswordMatch(password === confirmPassword);
    }, [password, confirmPassword]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate passwords
        if (!password || !confirmPassword) {
            setError(t('auth.passwordRequired'));
            return;
        }

        if (password !== confirmPassword) {
            setError(t('auth.passwordsDoNotMatch'));
            return;
        }

        if (passwordStrength === 'weak') {
            setError(t('auth.passwordTooWeak'));
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Simulate API call to reset password
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Success!
            setIsSuccess(true);
        } catch (err: any) {
            console.error('Password reset error:', err);
            setError(err.message || t('auth.resetPasswordFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    // If token is invalid, show error
    if (tokenChecking) {
        return (
            <div className={styles.authPage}>
                <div className={resetStyles.loadingContainer}>
                    <div className={resetStyles.spinner}></div>
                    <p>{t('auth.validatingToken')}</p>
                </div>
            </div>
        );
    }

    // If token is invalid, show error
    if (tokenValid === false) {
        return (
            <div className={styles.authPage}>
                <div className={resetStyles.invalidTokenContainer}>
                    <div className={resetStyles.invalidTokenIcon}>
                        <AlertCircle size={48} className={resetStyles.errorIcon} />
                    </div>
                    <h2 className={resetStyles.invalidTokenTitle}>{t('auth.invalidOrExpiredToken')}</h2>
                    <p className={resetStyles.invalidTokenMessage}>
                        {t('auth.invalidTokenMessage')}
                    </p>
                    <div className={resetStyles.actions}>
                        <Link to="/forgot-password" className={resetStyles.requestNewLink}>
                            {t('auth.requestNewLink')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // If we've successfully reset the password, show success screen
    if (isSuccess) {
        return (
            <div className={styles.authPage}>
                <div className={resetStyles.successContainer}>
                    <div className={resetStyles.successIcon}>
                        <CheckCircle size={48} />
                    </div>
                    <h2 className={resetStyles.successTitle}>{t('auth.passwordResetSuccess')}</h2>
                    <p className={resetStyles.successMessage}>
                        {t('auth.passwordResetSuccessMessage')}
                    </p>
                    <div className={resetStyles.actions}>
                        <Link to="/login" className={resetStyles.loginButton}>
                            {t('auth.proceedToLogin')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Show reset form
    return (
        <div className={styles.authPage}>
            <div className={styles.authHeader}>
                <h1>{t('auth.resetPassword')}</h1>
                <p>{t('auth.resetPasswordDescription')}</p>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            <form className={styles.authForm} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="password" className={styles.formLabel}>{t('auth.newPassword')}</label>
                    <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>
              <Lock size={18} />
            </span>
                        <input
                            id="password"
                            type="password"
                            className={styles.formControl}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                checkPasswordStrength(e.target.value);
                            }}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    {passwordStrength && (
                        <div className={resetStyles.passwordStrength}>
                            <div className={resetStyles.strengthLabel}>{t(`auth.passwordStrength.${passwordStrength}`)}</div>
                            <div className={resetStyles.strengthBar}>
                                <div
                                    className={`${resetStyles.strengthFill} ${resetStyles[passwordStrength]}`}
                                    style={{ width: passwordStrength === 'weak' ? '30%' : passwordStrength === 'medium' ? '70%' : '100%' }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword" className={styles.formLabel}>{t('auth.confirmPassword')}</label>
                    <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>
              <Lock size={18} />
            </span>
                        <input
                            id="confirmPassword"
                            type="password"
                            className={`${styles.formControl} ${confirmPassword ? (passwordMatch ? resetStyles.validInput : resetStyles.invalidInput) : ''}`}
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                checkPasswordsMatch();
                            }}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    {confirmPassword && !passwordMatch && (
                        <div className={`${resetStyles.validationMessage} ${resetStyles.invalidMessage}`}>
                            <AlertCircle size={16} />
                            <span>{t('auth.passwordsDoNotMatch')}</span>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className={styles.spinner}></span>
                    ) : null}
                    {t('auth.resetPassword')}
                </button>
            </form>

            <div className={resetStyles.backToLoginWrapper}>
                <Link to="/login" className={resetStyles.backToLogin}>
                    {t('auth.backToLogin')}
                </Link>
            </div>
        </div>
    );
};

export default ResetPassword;