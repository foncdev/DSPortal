// app/src/pages/profile/Profile.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    User,
    Mail,
    Key,
    Edit2,
    Save,
    Upload
} from 'lucide-react';
import PageTitle from '../../layouts/components/common/PageTitle';
import { authManager, updateUserInfo } from '@ds/core';
import styles from './Profile.module.scss';

const Profile: React.FC = () => {
    const { t } = useTranslation();
    const user = authManager.getCurrentUser();

    // Edit states
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    // Form values
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Error states
    const [profileError, setProfileError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    // Handle profile update
    const handleUpdateProfile = () => {
        if (!user) return;

        setProfileError(null);

        if (!name.trim()) {
            setProfileError(t('profile.nameRequired'));
            return;
        }

        if (!email.trim()) {
            setProfileError(t('profile.emailRequired'));
            return;
        }

        try {
            // In a real app, this would call an API
            // updatedUser 변수 제거하고 updateUserInfo 함수 직접 호출
            updateUserInfo({
                name,
                email
            });

            setIsEditingProfile(false);
        } catch (error: any) {
            setProfileError(error.message || t('profile.updateError'));
        }
    };

    // Handle password change
    const handleChangePassword = () => {
        setPasswordError(null);

        if (!currentPassword) {
            setPasswordError(t('profile.currentPasswordRequired'));
            return;
        }

        if (!newPassword) {
            setPasswordError(t('profile.newPasswordRequired'));
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError(t('profile.passwordsDoNotMatch'));
            return;
        }

        try {
            // In a real app, this would call an API
            authManager.changePassword({
                currentPassword,
                newPassword,
                confirmPassword
            });

            // Reset form and close edit mode
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsEditingPassword(false);
        } catch (error: any) {
            setPasswordError(error.message || t('profile.passwordUpdateError'));
        }
    };

    // Cancel editing
    const cancelEditProfile = () => {
        setName(user?.name || '');
        setEmail(user?.email || '');
        setIsEditingProfile(false);
        setProfileError(null);
    };

    const cancelEditPassword = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsEditingPassword(false);
        setPasswordError(null);
    };

    if (!user) {
        return (
            <div className={styles.profileError}>
                <h2>{t('profile.userNotFound')}</h2>
                <p>{t('profile.loginRequired')}</p>
            </div>
        );
    }

    return (
        <div className={styles.profile}>
            <PageTitle
                title={t('profile.title')}
                description={t('profile.subtitle')}
            />

            {/* 나머지 컴포넌트 내용은 변경 없음 */}
            {/* ... */}
        </div>
    );
};

export default Profile;