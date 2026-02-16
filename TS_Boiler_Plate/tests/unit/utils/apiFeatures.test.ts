import { describe, it, expect } from 'vitest';
import { buildApiQuery } from '../../../src/utils/apiFeatures.js';

describe('apiFeatures - buildApiQuery', () => {
    it('should return correct pagination defaults', () => {
        const query = {};
        const result = buildApiQuery(query, {
            defaultLimit: 10,
            defaultSortBy: 'createdAt'
        });

        expect(result.pagination.page).toBe(1);
        expect(result.pagination.limit).toBe(10);
        expect(result.pagination.sort).toEqual({ createdAt: -1 });
    });

    it('should parse search terms correctly', () => {
        const query = { searchTerm: 'nayem' };
        const result = buildApiQuery(query, {
            searchableFields: ['firstName', 'email']
        });

        expect(result.search).toEqual({
            term: 'nayem',
            fields: ['firstName', 'email']
        });
    });

    it('should filter allowed fields only', () => {
        const query = { role: 'admin', secret: '123' };
        const result = buildApiQuery(query, {
            filterableFields: ['role']
        });

        expect(result.filters).toEqual({ role: 'admin' });
        expect(result.filters).not.toHaveProperty('secret');
    });

    it('should handle pagination and sorting overrides', () => {
        const query = { page: '2', limit: '5', sortBy: 'email', sortOrder: 'asc' };
        const result = buildApiQuery(query, {
            allowedSortBy: ['email', 'createdAt']
        });

        expect(result.pagination.page).toBe(2);
        expect(result.pagination.limit).toBe(5);
        expect(result.pagination.sort).toEqual({ email: 1 });
    });
});
