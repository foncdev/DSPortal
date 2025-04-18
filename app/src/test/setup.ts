import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 전역 모킹 설정
vi.mock('@ds/core', async () => ({
        getDocuments: vi.fn(),
        User: vi.fn(),
        Document: vi.fn()
    }));

vi.mock('@ds/utils', async () => ({
        truncateText: vi.fn((text, maxLength) =>
            text.length > maxLength
                ? text.substring(0, maxLength) + '...'
                : text
        )
    }));