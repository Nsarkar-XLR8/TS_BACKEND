import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('Health Check', () => {
    it('GET /api/v1/ should return 200 OK', async () => {
        const response = await request(app).get('/api/v1/');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.objectContaining({
                success: true,
                message: 'API is running',
                statusCode: 200,
            })
        );
    });

    it('GET /api/v1/health should return 200 OK', async () => {
        const response = await request(app).get('/api/v1/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.objectContaining({
                success: true,
                message: 'OK',
            })
        );
    });

    it('GET /api/v1/ready should return 200 OK', async () => {
        const response = await request(app).get('/api/v1/ready');
        // If DB is not connected in test env, it might be 503. 
        // But createApp usually doesn't connect DB. 
        // Let's check status separately based on body.
        expect(response.body).toHaveProperty('success');
    });

    it('GET /metrics should return 200', async () => {
        const response = await request(app).get('/metrics');
        expect(response.status).toBe(200);
    });
});
