// app/src/pages/EmptyPage.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './EmptyPage.module.scss';

const EmptyPage: React.FC = () => {
    const location = useLocation();

    return (
        <div className={styles.emptyPage}>
            <div className={styles.card}>
                <h1 className={styles.title}>페이지 개발 중</h1>
                <p className={styles.path}>경로: {location.pathname}</p>
                <p className={styles.message}>
                    이 페이지는 현재 개발 중입니다.
                    메뉴 네비게이션 테스트를 위한 빈 페이지입니다.
                </p>
            </div>
        </div>
    );
};

export default EmptyPage;