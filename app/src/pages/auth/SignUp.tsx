// app/src/pages/auth/SignUp.tsx - Updated with validation utilities
import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Mail,
    Lock,
    User,
    Building,
    Phone,
    CheckCircle,
    AlertCircle,
    Loader
} from 'lucide-react';
import { authManager } from '@ds/core';
import {
    isValidUsername,
    getUsernameValidationError,
    isValidEmail,
    validatePassword,
    PasswordStrength,
    doPasswordsMatch,
    isValidPhoneNumber,
    formatPhoneNumber,
    isValidName,
    isValidCompanyName
} from '@ds/utils';
import styles from './Auth.module.scss';
import signupStyles from './SignUp.module.scss';

// Form field validation type
interface ValidationState {
    valid: boolean;
    message: string;
}

// Main SignUp component
const SignUp: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Form fields state
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [userType, setUserType] = useState<'user' | 'vendor'>('user');
    const [agreeTerms, setAgreeTerms] = useState(false);

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [isSendingVerificationCode, setIsSendingVerificationCode] = useState(false);
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);

    // Validation state
    const [usernameValidation, setUsernameValidation] = useState<ValidationState>({ valid: false, message: '' });
    const [emailValidation, setEmailValidation] = useState<ValidationState>({ valid: false, message: '' });
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | ''>('');
    const [passwordMatch, setPasswordMatch] = useState(false);

    // Check if username is available
    const checkUsername = useCallback(async () => {
        if (!username) {return;}

        // 사용자 아이디 유효성 검사
        const error = getUsernameValidationError(username);
        if (error) {
            setUsernameValidation({ valid: false, message: error });
            return;
        }

        setIsCheckingUsername(true);

        // Simulate API call to check username availability
        try {
            // In a real implementation, call an API to check
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Reject some usernames as "already taken" for demonstration
            if (['admin', 'test', 'user'].includes(username.toLowerCase())) {
                setUsernameValidation({ valid: false, message: t('auth.usernameUnavailable') });
            }
            else {
                setUsernameValidation({ valid: true, message: t('auth.usernameAvailable') });
            }
        } catch (err) {
            setUsernameValidation({ valid: false, message: t('auth.errorCheckingUsername') });
        } finally {
            setIsCheckingUsername(false);
        }
    }, [username, t]);

    // Check if email is available
    const checkEmail = useCallback(async () => {
        if (!email) {return;}

        // 이메일 유효성 검사
        if (!isValidEmail(email)) {
            setEmailValidation({ valid: false, message: t('auth.invalidEmail') });
            return;
        }

        setIsCheckingEmail(true);

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            // For demo purposes, reject some emails as "already registered"
            if (['test@example.com', 'admin@example.com'].includes(email.toLowerCase())) {
                setEmailValidation({ valid: false, message: t('auth.emailUnavailable') });
            } else {
                setEmailValidation({ valid: true, message: t('auth.emailAvailable') });
            }
        } catch (err) {
            setEmailValidation({ valid: false, message: t('auth.errorCheckingEmail') });
        } finally {
            setIsCheckingEmail(false);
        }
    }, [email, t]);

    // Format and validate phone number as user types
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9-+]/g, '');
        const formattedPhone = formatPhoneNumber(value);
        setPhone(formattedPhone);
        setPhoneVerified(false); // Reset verification when phone changes
    };

    // Send verification code to phone
    const sendVerificationCode = useCallback(async () => {
        if (!phone || !isValidPhoneNumber(phone)) {
            return;
        }

        setIsSendingVerificationCode(true);

        try {
            // Simulate API call to send verification code
            await new Promise(resolve => setTimeout(resolve, 1500));

            // For demo, we'll just say it was sent
            alert(t('auth.verificationCodeSent'));
        } catch (err) {
            alert(t('auth.errorSendingVerificationCode'));
        } finally {
            setIsSendingVerificationCode(false);
        }
    }, [phone, t]);

    // Verify the code
    const verifyCode = useCallback(async () => {
        if (!verificationCode) {return;}

        setIsVerifyingCode(true);

        try {
            // Simulate API call to verify code
            await new Promise(resolve => setTimeout(resolve, 1000));

            // For demo purposes, any 6-digit code is valid
            if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
                setPhoneVerified(true);
            } else {
                alert(t('auth.invalidVerificationCode'));
            }
        } catch (err) {
            alert(t('auth.errorVerifyingCode'));
        } finally {
            setIsVerifyingCode(false);
        }
    }, [verificationCode, t]);

    // Check password strength
    const checkPasswordStrength = useCallback((pwd: string) => {
        if (!pwd) {
            setPasswordStrength('');
            return;
        }

        // Use validation utility
        const validationResult = validatePassword(pwd);

        if (validationResult.strength === PasswordStrength.WEAK) {
            setPasswordStrength('weak');
        } else if (validationResult.strength === PasswordStrength.MEDIUM) {
            setPasswordStrength('medium');
        } else if (validationResult.strength === PasswordStrength.STRONG) {
            setPasswordStrength('strong');
        } else {
            setPasswordStrength('');
        }

        // Also check if passwords match
        if (confirmPassword) {
            setPasswordMatch(doPasswordsMatch(pwd, confirmPassword));
        }
    }, [confirmPassword]);

    // Check if passwords match
    const checkPasswordsMatch = useCallback(() => {
        if (!password || !confirmPassword) {return;}
        setPasswordMatch(doPasswordsMatch(password, confirmPassword));
    }, [password, confirmPassword]);

    // Move to next step
    const goToNextStep = () => {
        // Perform validations before proceeding
        if (currentStep === 1) {
            // Check username
            if (!username || !usernameValidation.valid) {
                setError(t('auth.pleaseEnterValidUsername'));
                return;
            }

            // Check name
            if (!isValidName(name)) {
                setError(t('auth.pleaseEnterValidName'));
                return;
            }

            // Check email
            if (!isValidEmail(email) || !emailValidation.valid) {
                setError(t('auth.pleaseEnterValidEmail'));
                return;
            }

            // Check phone verification
            if (!phoneVerified) {
                setError(t('auth.phoneVerificationRequired'));
                return;
            }

            // Check company name for vendor accounts
            if (userType === 'vendor' && !isValidCompanyName(companyName)) {
                setError(t('auth.pleaseEnterValidCompanyName'));
                return;
            }
        }

        setCurrentStep(step => step + 1);
        setError(null);
    };

    // Go back to previous step
    const goToPreviousStep = () => {
        setCurrentStep(step => Math.max(1, step - 1));
        setError(null);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Final validations
        const passwordValidation = validatePassword(password);

        if (!passwordValidation.isValid) {
            setError(passwordValidation.errors[0] || t('auth.invalidPassword'));
            return;
        }

        if (!doPasswordsMatch(password, confirmPassword)) {
            setError(t('auth.passwordsDoNotMatch'));
            return;
        }

        if (!agreeTerms) {
            setError(t('auth.mustAgreeToTerms'));
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Create user with the appropriate role based on user type
            await authManager.signup({
                name,
                email,
                password,
                confirmPassword,
                role: userType // This will be used by the core module
            });

            // Redirect to success page
            navigate('/signup/success');
        } catch (err: any) {
            console.error('Signup error:', err);
            setError(err.message || t('auth.signupFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.authHeader}>
                <h1>{t('auth.signup')}</h1>
                <p>{t('auth.signupDescription')}</p>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            <form className={styles.authForm} onSubmit={handleSubmit}>
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                    <>
                        <div className={signupStyles.userTypeSelector}>
                            <button
                                type="button"
                                className={`${signupStyles.userTypeButton} ${userType === 'user' ? signupStyles.active : ''}`}
                                onClick={() => setUserType('user')}
                            >
                                <User size={18} />
                                <span>{t('auth.regularUser')}</span>
                            </button>
                            <button
                                type="button"
                                className={`${signupStyles.userTypeButton} ${userType === 'vendor' ? signupStyles.active : ''}`}
                                onClick={() => setUserType('vendor')}
                            >
                                <Building size={18} />
                                <span>{t('auth.vendorAccount')}</span>
                            </button>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="username" className={styles.formLabel}>{t('auth.username')}</label>
                            <div className={`${styles.inputWrapper} ${signupStyles.validationInput}`}>
                <span className={styles.inputIcon}>
                  <User size={18} />
                </span>
                                <input
                                    id="username"
                                    type="text"
                                    className={`${styles.formControl} ${usernameValidation.valid ? signupStyles.validInput : ''} ${usernameValidation.valid === false && username ? signupStyles.invalidInput : ''}`}
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        setUsernameValidation({ valid: false, message: '' });
                                    }}
                                    placeholder={t('auth.usernamePlaceholder')}
                                    required
                                />
                                <button
                                    type="button"
                                    className={signupStyles.checkButton}
                                    onClick={checkUsername}
                                    disabled={!username || isCheckingUsername}
                                >
                                    {isCheckingUsername ? (
                                        <Loader size={16} className={signupStyles.spinner} />
                                    ) : (
                                        t('auth.check')
                                    )}
                                </button>
                            </div>
                            {usernameValidation.message && (
                                <div className={`${signupStyles.validationMessage} ${usernameValidation.valid ? signupStyles.validMessage : signupStyles.invalidMessage}`}>
                                    {usernameValidation.valid ? (
                                        <CheckCircle size={16} />
                                    ) : (
                                        <AlertCircle size={16} />
                                    )}
                                    <span>{usernameValidation.message}</span>
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="name" className={styles.formLabel}>{t('auth.name')}</label>
                            <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <User size={18} />
                </span>
                                <input
                                    id="name"
                                    type="text"
                                    className={styles.formControl}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t('auth.namePlaceholder')}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.formLabel}>{t('auth.email')}</label>
                            <div className={`${styles.inputWrapper} ${signupStyles.validationInput}`}>
                <span className={styles.inputIcon}>
                  <Mail size={18} />
                </span>
                                <input
                                    id="email"
                                    type="email"
                                    className={`${styles.formControl} ${emailValidation.valid ? signupStyles.validInput : ''} ${emailValidation.valid === false && email ? signupStyles.invalidInput : ''}`}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setEmailValidation({ valid: false, message: '' });
                                    }}
                                    placeholder="example@company.com"
                                    required
                                />
                                <button
                                    type="button"
                                    className={signupStyles.checkButton}
                                    onClick={checkEmail}
                                    disabled={!email || isCheckingEmail}
                                >
                                    {isCheckingEmail ? (
                                        <Loader size={16} className={signupStyles.spinner} />
                                    ) : (
                                        t('auth.check')
                                    )}
                                </button>
                            </div>
                            {emailValidation.message && (
                                <div className={`${signupStyles.validationMessage} ${emailValidation.valid ? signupStyles.validMessage : signupStyles.invalidMessage}`}>
                                    {emailValidation.valid ? (
                                        <CheckCircle size={16} />
                                    ) : (
                                        <AlertCircle size={16} />
                                    )}
                                    <span>{emailValidation.message}</span>
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="phone" className={styles.formLabel}>{t('auth.phone')}</label>
                            <div className={`${styles.inputWrapper} ${signupStyles.validationInput}`}>
                <span className={styles.inputIcon}>
                  <Phone size={18} />
                </span>
                                <input
                                    id="phone"
                                    type="tel"
                                    className={`${styles.formControl} ${phoneVerified ? signupStyles.validInput : ''}`}
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    placeholder={t('auth.phonePlaceholder')}
                                    disabled={phoneVerified} // Disable after verification
                                    required
                                />
                                <button
                                    type="button"
                                    className={signupStyles.checkButton}
                                    onClick={sendVerificationCode}
                                    disabled={!isValidPhoneNumber(phone) || phoneVerified || isSendingVerificationCode}
                                >
                                    {isSendingVerificationCode ? (
                                        <Loader size={16} className={signupStyles.spinner} />
                                    ) : phoneVerified ? (
                                        <CheckCircle size={16} />
                                    ) : (
                                        t('auth.sendCode')
                                    )}
                                </button>
                            </div>

                            {!phoneVerified && (
                                <div className={`${styles.inputWrapper} ${signupStyles.verificationInput}`}>
                                    <input
                                        type="text"
                                        className={styles.formControl}
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder={t('auth.verificationCodePlaceholder')}
                                        maxLength={6}
                                    />
                                    <button
                                        type="button"
                                        className={signupStyles.verifyButton}
                                        onClick={verifyCode}
                                        disabled={!verificationCode || verificationCode.length < 6 || isVerifyingCode}
                                    >
                                        {isVerifyingCode ? (
                                            <Loader size={16} className={signupStyles.spinner} />
                                        ) : (
                                            t('auth.verify')
                                        )}
                                    </button>
                                </div>
                            )}

                            {phoneVerified && (
                                <div className={`${signupStyles.validationMessage} ${signupStyles.validMessage}`}>
                                    <CheckCircle size={16} />
                                    <span>{t('auth.phoneVerified')}</span>
                                </div>
                            )}
                        </div>

                        {/* Vendor-specific fields */}
                        {userType === 'vendor' && (
                            <div className={styles.formGroup}>
                                <label htmlFor="companyName" className={styles.formLabel}>{t('auth.companyName')}</label>
                                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <Building size={18} />
                  </span>
                                    <input
                                        id="companyName"
                                        type="text"
                                        className={styles.formControl}
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder={t('auth.companyNamePlaceholder')}
                                        required={userType === 'vendor'}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Step 2: Password and Terms */}
                {currentStep === 2 && (
                    <>
                        <div className={styles.formGroup}>
                            <label htmlFor="password" className={styles.formLabel}>{t('auth.password')}</label>
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
                                <div className={signupStyles.passwordStrength}>
                                    <div className={signupStyles.strengthLabel}>{t(`auth.passwordStrength.${passwordStrength}`)}</div>
                                    <div className={signupStyles.strengthBar}>
                                        <div
                                            className={`${signupStyles.strengthFill} ${signupStyles[passwordStrength]}`}
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
                                    className={`${styles.formControl} ${confirmPassword ? (passwordMatch ? signupStyles.validInput : signupStyles.invalidInput) : ''}`}
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
                                <div className={`${signupStyles.validationMessage} ${signupStyles.invalidMessage}`}>
                                    <AlertCircle size={16} />
                                    <span>{t('auth.passwordsDoNotMatch')}</span>
                                </div>
                            )}
                        </div>

                        <div className={signupStyles.termsContainer}>
                            <label className={signupStyles.termsLabel}>
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                    className={signupStyles.termsCheckbox}
                                    required
                                />
                                <span>{t('auth.agreeToTerms')}</span>
                            </label>
                            <Link to="/terms" className={signupStyles.termsLink} target="_blank">
                                {t('auth.viewTerms')}
                            </Link>
                        </div>
                    </>
                )}

                {/* Navigation buttons */}
                <div className={signupStyles.formNavigation}>
                    {currentStep > 1 && (
                        <button
                            type="button"
                            className={signupStyles.backButton}
                            onClick={goToPreviousStep}
                            disabled={isLoading}
                        >
                            {t('auth.back')}
                        </button>
                    )}

                    {currentStep < 2 ? (
                        <button
                            type="button"
                            className={signupStyles.nextButton}
                            onClick={goToNextStep}
                        >
                            {t('auth.next')}
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className={styles.spinner}></span>
                            ) : (
                                <CheckCircle size={18} className={styles.buttonIcon} />
                            )}
                            {t('auth.createAccount')}
                        </button>
                    )}
                </div>
            </form>

            {/* Footer link to login */}
            <div className={styles.authFooter}>
                <p>
                    {t('auth.alreadyHaveAccount')} <Link to="/login">{t('auth.login')}</Link>
                </p>
            </div>

            {/* Progress steps indicator */}
            <div className={signupStyles.progressSteps}>
                <div className={`${signupStyles.step} ${currentStep >= 1 ? signupStyles.active : ''}`}>1</div>
                <div className={signupStyles.stepLine}></div>
                <div className={`${signupStyles.step} ${currentStep >= 2 ? signupStyles.active : ''}`}>2</div>
            </div>
        </div>
    );
};

export default SignUp;