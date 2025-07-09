// backend/__tests__/routes.test.ts
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { sequelize } from '../src/config/database';      // ← import here
import incidentRoutes from '../src/routes/incidents';
import { authenticate } from '../src/middleware/auth';

jest.mock('../src/middleware/auth', () => ({
    authenticate: (req: Request, res: Response, next: NextFunction) => {
        (req as any).uid = 'u1';
        return next();
    },
}));

const app = express();
app.use(express.json());
app.use('/api', incidentRoutes);

describe('API routes', () => {
    it('POST /api/incidents → 201', async () => {
        const res = await request(app)
            .post('/api/incidents')
            .set('Authorization', 'Bearer tok')
            .send({ type: 'fall', description: 'desc' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
    });

    it('GET /api/incidents → 200', async () => {
        const res = await request(app)
            .get('/api/incidents')
            .set('Authorization', 'Bearer tok');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

// Tear down the DB connection so Jest can exit
afterAll(async () => {
    await sequelize.close();
});
