import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('Health Check', () => {
    it('GET / should return 200 OK', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.objectContaining({
                success: true,
                message: 'OK',
                statusCode: 200,
            })
        );
    });

    it('GET /metrics should return 200', async () => {
        const response = await request(app).get('/metrics');
        expect(response.status).toBe(200);
    });
});
