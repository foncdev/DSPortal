import { vi } from 'vitest';

// localStorage 모킹
const createLocalStorageMock = () => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value.toString(); }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
        length: Object.keys(store).length,
        key: vi.fn((idx: number) => Object.keys(store)[idx] || null)
    };
};

// localStorage 모킹
const localStorageMock = createLocalStorageMock();

// global 객체에 localStorage 추가
Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true
});

// 테스트 전에 항상 스토리지 초기화
// @ts-ignore
beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
});

// 필요한 경우 window 객체 추가
if (typeof window === 'undefined') {
    (global as any).window = global;
}