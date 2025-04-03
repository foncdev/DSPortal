import styles from './Header.module.scss';

export default function Header() {
    return (
        <header className={styles.header}>
            <div className="container mx-auto">
                <div className={styles.logo}>로고</div>
                <nav className={styles.nav}>
                    <a href="#" className="hover:text-blue-700">홈</a>
                    <a href="#" className="hover:text-blue-700">서비스</a>
                    <a href="#" className="hover:text-blue-700">소개</a>
                </nav>
            </div>
        </header>
    );
}