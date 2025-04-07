import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import styles from '../DataTable.module.scss';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    itemsPerPageOptions: number[];
    totalItems: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (value: number) => void;
    themeClass: string;
}

const Pagination: React.FC<PaginationProps> = ({
                                                   currentPage,
                                                   totalPages,
                                                   itemsPerPage,
                                                   itemsPerPageOptions,
                                                   totalItems,
                                                   onPageChange,
                                                   onItemsPerPageChange,
                                                   themeClass
                                               }) => {
    const { t } = useTranslation();

    // 페이지 번호 계산 - 최대 5개, 현재 페이지를 중심으로
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            // 전체 페이지가 5개 이하면 모든 페이지 표시
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else if (currentPage <= 3) {
            // 현재 페이지가 초반인 경우
            for (let i = 1; i <= 5; i++) {
                pages.push(i);
            }
        } else if (currentPage >= totalPages - 2) {
            // 현재 페이지가 후반인 경우
            for (let i = totalPages - 4; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // 현재 페이지가 중간인 경우, 현재 페이지 중심으로 양쪽 2개씩
            for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                pages.push(i);
            }
        }
        return pages;
    };

    // 현재 표시 중인 아이템 범위 계산
    const getDisplayRange = () => {
        const start = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
        const end = Math.min(currentPage * itemsPerPage, totalItems);
        return { start, end };
    };

    const range = getDisplayRange();
    const pageNumbers = getPageNumbers();

    return (
        <div
            className={`${styles.pagination} ${styles[themeClass]}`}
            role="navigation"
            aria-label={t('dataTable.pagination')}
        >
            <div className={styles.paginationInfo}>
                <div className={`${styles.infoText} ${styles[themeClass]}`}>
          <span className={`${styles.infoHighlight} ${styles[themeClass]}`}>
            {range.start}
          </span>
                    -
                    <span className={`${styles.infoHighlight} ${styles[themeClass]}`}>
            {range.end}
          </span>{' '}
                    {t('dataTable.of')}{' '}
                    <span className={`${styles.infoHighlight} ${styles[themeClass]}`}>
            {totalItems}
          </span>{' '}
                    {t('dataTable.items')}
                </div>

                <div className={styles.itemsPerPageSelect}>
                    <label
                        htmlFor="table-items-per-page"
                        className={`${styles.selectLabel} ${styles[themeClass]}`}
                    >
                        {t('dataTable.rowsPerPage')}:
                    </label>
                    <select
                        id="table-items-per-page"
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        className={`${styles.select} ${styles[themeClass]}`}
                        aria-label={t('dataTable.rowsPerPage')}
                    >
                        {itemsPerPageOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.paginationButtons}>
                {/* 첫 페이지 버튼 */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className={`${styles.pageButton} ${styles[themeClass]} ${currentPage === 1 ? styles.disabled : ''}`}
                    aria-label={t('dataTable.firstPage')}
                    aria-disabled={currentPage === 1}
                >
                    <ChevronsLeft size={16} />
                </button>

                {/* 이전 페이지 버튼 */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`${styles.pageButton} ${styles[themeClass]} ${currentPage === 1 ? styles.disabled : ''}`}
                    aria-label={t('dataTable.previousPage')}
                    aria-disabled={currentPage === 1}
                >
                    <ChevronLeft size={16} />
                </button>

                {/* 페이지 번호 버튼 */}
                {pageNumbers.map(pageNum => (
                    <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`${styles.pageButton} ${styles[themeClass]} ${currentPage === pageNum ? styles.active : ''}`}
                        aria-label={`${t('dataTable.page')} ${pageNum}`}
                        aria-current={currentPage === pageNum ? "page" : undefined}
                    >
                        {pageNum}
                    </button>
                ))}

                {/* 다음 페이지 버튼 */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`${styles.pageButton} ${styles[themeClass]} ${currentPage === totalPages ? styles.disabled : ''}`}
                    aria-label={t('dataTable.nextPage')}
                    aria-disabled={currentPage === totalPages}
                >
                    <ChevronRight size={16} />
                </button>

                {/* 마지막 페이지 버튼 */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`${styles.pageButton} ${styles[themeClass]} ${currentPage === totalPages ? styles.disabled : ''}`}
                    aria-label={t('dataTable.lastPage')}
                    aria-disabled={currentPage === totalPages}
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;