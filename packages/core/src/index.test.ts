import { describe, it, expect } from 'vitest';
import { getUserInfo } from './user';

describe('Core package', () => {
    it('getUserInfo should return a user object', () => {
        const user = getUserInfo();
        expect(user).toBeDefined();
        expect(user.id).toBeDefined();
        expect(user.name).toBeDefined();
        expect(user.email).toBeDefined();
    });
});
