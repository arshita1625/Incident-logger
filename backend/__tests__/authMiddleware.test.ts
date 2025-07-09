// backend/__tests__/authMiddleware.test.ts
import { authenticate, AuthRequest } from '../src/middleware/auth';
import { auth as firebaseAuth } from '../src/config/firebase';
import { Request, Response, NextFunction } from 'express';

jest.mock('../src/config/firebase', () => ({
    auth: {
        verifyIdToken: jest.fn(),
    },
}));

describe('authenticate middleware', () => {
    let req: Partial<AuthRequest>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        (firebaseAuth.verifyIdToken as jest.Mock).mockReset();
    });

    it('rejects when no Authorization header', async () => {
        await authenticate(req as AuthRequest, res as Response, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Missing token' });
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects on invalid token', async () => {
        req.headers = { authorization: 'Bearer bad.token' };
        (firebaseAuth.verifyIdToken as jest.Mock).mockRejectedValue(new Error('fail'));
        await authenticate(req as AuthRequest, res as Response, next);
        expect(firebaseAuth.verifyIdToken).toHaveBeenCalledWith('bad.token');
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
        expect(next).not.toHaveBeenCalled();
    });

    it('attaches uid and calls next on valid token', async () => {
        req.headers = { authorization: 'Bearer good.token' };
        (firebaseAuth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'user123' });
        await authenticate(req as AuthRequest, res as Response, next);
        expect((req as AuthRequest).uid).toBe('user123');
        expect(next).toHaveBeenCalled();
    });
});
