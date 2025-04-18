// src/pages/FileManagerDemo.tsx
import React, { useState, useEffect } from 'react';
import FileManager from '../components/FileManager';
import styles from './FileManagerDemo.module.scss';

// Mock data in the expected API format
const mockApiResponse = {
  success: true,
  code: 200,
  status: 'OK',
  msg: 'Success',
  errors: [],
  data: [
    {
      id: 23,
      parentId: 0,
      type: 'folder',
      name: 'BK_GAMARO_TEST',
      size: 0,
      thumbnail: null,
      url: null,
      md5: null,
      expirationAt: null,
      createAt: '2024-09-20 10:19:35',
      modifiedDate: '2024-09-20 10:19:35',
    },
    {
      id: 253,
      parentId: 0,
      type: 'video',
      name: 'CK_FA24_NewJeans_H.mp4',
      size: 27661956,
      thumbnail: 'https://picsum.photos/600/400',
      url: 'https://picsum.photos/600/400',
      md5: '7d2dc2e59571af0a1452181af5fd2b17',
      expirationAt: '2025-09-25 00:35:54',
      createAt: '2024-09-25 00:35:54',
      modifiedDate: null,
    },
    {
      id: 282,
      parentId: 0,
      type: 'video',
      name: 'CK_FA24_NewJeans_Vorigin.mp4',
      size: 9612421,
      thumbnail: 'https://picsum.photos/600/400',
      url: 'https://picsum.photos/600/400',
      md5: '3a68fb0dcb44dda1b85ff28601c23c71',
      expirationAt: '2025-10-18 00:32:36',
      createAt: '2024-10-18 00:32:36',
      modifiedDate: null,
    },
    {
      id: 290,
      parentId: 0,
      type: 'image',
      name: 'sample-image.jpg',
      size: 245000,
      thumbnail: 'https://picsum.photos/600/400',
      url: 'https://picsum.photos/600/400',
      md5: '5a72fb0dcb41dd5185af28601c46c92',
      expirationAt: '2025-10-18 00:32:36',
      createAt: '2024-10-15 12:24:16',
      modifiedDate: null,
    },
    {
      id: 295,
      parentId: 0,
      type: 'pdf',
      name: 'documentation.pdf',
      size: 1250000,
      thumbnail: 'https://picsum.photos/600/400',
      url: 'https://picsum.photos/600/400',
      md5: '7c45de2f9a61bc0a2378181af5fd3c28',
      expirationAt: '2025-10-20 14:36:41',
      createAt: '2024-10-17 14:36:41',
      modifiedDate: null,
    },
    {
      id: 305,
      parentId: 23,
      type: 'image',
      name: 'project-image.png',
      size: 350000,
      thumbnail: 'https://picsum.photos/600/400',
      url: 'https://picsum.photos/600/400',
      md5: '8e52ac3b71f9de0c1563181af5fd4d39',
      expirationAt: '2025-10-22 09:15:27',
      createAt: '2024-10-19 09:15:27',
      modifiedDate: null,
    },
  ],
};
const originalFetch = window.fetch;

// Setup mock API
const setupMockAPI = () => {
  // Override fetch to return mock data
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : input instanceof Request ? input.url : '';

    // Mock API responses based on URL
    if (url.includes('/api/files')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      } as Response);
    }

    if (url.includes('/api/folders')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      } as Response);
    }

    // For any other requests, use the original fetch
    return originalFetch(input, init);
  };
};

const FileManagerDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Setup mock API and simulate loading
  useEffect(() => {
    setupMockAPI();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Check system preference for dark mode on initial load
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDarkMode);

    // Apply dark mode based on system preference
    if (prefersDarkMode) {
      document.documentElement.classList.add('dark');
    }

    return () => {
      clearTimeout(timer);
      // Restore original fetch when component unmounts
      window.fetch = originalFetch;
    };
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
      <div className={styles.pageContainer}>
        {/* Header bar */}
        <header className={styles.header}>
          <div className={styles.headerContainer}>
            <h1 className={styles.pageTitle}>File Manager Demo</h1>
            <button
                onClick={toggleDarkMode}
                className={styles.themeButton}
            >
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </header>

        {/* Main content area */}
        <main className={styles.mainContent}>
          <div className={styles.contentContainer}>
            {/* File manager container */}
            <div className={styles.fileManagerContainer}>
              {isLoading ? (
                  <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner} />
                  </div>
              ) : (
                  <FileManager initialFolderId={null} />
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerContainer}>
            <p className={styles.footerText}>
              This demo uses the FileManager component with mock API implementation.
            </p>
          </div>
        </footer>
      </div>
  );
};

export default FileManagerDemo;
