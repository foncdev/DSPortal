import { vi } from 'vitest';

// localStorage 모킹
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        key: vi.fn((index: number) => Object.keys(store)[index] || null),
        length: Object.keys(store).length
    };
})();

// 전역 객체 모킹
global.localStorage = localStorageMock;

// Node.js 환경에서 window 객체 모킹
if (typeof window === 'undefined') {
    global.window = {} as any;
    global.window.localStorage = localStorageMock;
}

// 테스트 전후 처리
beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
});