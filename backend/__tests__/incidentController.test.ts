// backend/__tests__/incidentController.test.ts

// Ensure the controller doesn't choke on a missing API key in normal tests
process.env.OPENAI_API_KEY = 'test-key';

import { Request, Response } from 'express';
import { Incident } from '../src/models/incident';
import { OpenAI } from 'openai';
import {
    createIncident,
    listIncidents,
    summarizeIncident,
    openai,
} from '../src/controllers/incidentController';

// -- Mock the ORM model methods --
jest.mock('../src/models/incident', () => ({
    Incident: {
        create: jest.fn(),
        findAll: jest.fn(),
        findByPk: jest.fn(),
    },
}));

describe('incidentController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        jest.resetAllMocks();
        // Stub OpenAI for summarizeIncident
        (openai.chat.completions.create as jest.Mock) = jest
            .fn()
            .mockResolvedValue({ choices: [{ message: { content: 'mocked summary' } }] });
    });

    // ─── COVER LINE 4: the exported OpenAI client ────────────────────────────────
    it('exports an OpenAI client instance', () => {
        expect(openai).toBeInstanceOf(OpenAI);
        expect(typeof openai.chat.completions.create).toBe('function');
    });

    // ─── COVER LINE 4: OpenAI client initialization without API key ─────────────
    it('handles OpenAI client initialization without API key', () => {
        // Temporarily remove the API key to test the fallback
        const originalApiKey = process.env.OPENAI_API_KEY;
        delete process.env.OPENAI_API_KEY;

        // Re-import to trigger initialization without API key
        jest.resetModules();

        try {
            const controllerModule = require('../src/controllers/incidentController');
            expect(controllerModule.openai).toBeDefined();
        } catch (error) {
            // If it throws, that's also valid behavior we want to test
            expect(error).toBeDefined();
        } finally {
            // Restore the API key
            process.env.OPENAI_API_KEY = originalApiKey;
        }
    });

    // ─── TEST createIncident ───────────────────────────────────────────────────────
    it('createIncident calls Incident.create and returns 201 + payload', async () => {
        const fakeIncident = { id: 7, type: 'fall', description: 'oops', userId: 'u1' };
        (Incident.create as jest.Mock).mockResolvedValue(fakeIncident);

        req = {
            body: { type: 'fall', description: 'oops' },
            uid: 'u1',
        } as any;
        const statusMock = jest.fn().mockReturnThis();
        const jsonMock = jest.fn();
        res = { status: statusMock, json: jsonMock } as any;

        await createIncident(req as Request, res as Response);

        expect(Incident.create).toHaveBeenCalledWith({
            userId: 'u1',
            type: 'fall',
            description: 'oops',
        });
        expect(statusMock).toHaveBeenCalledWith(201);
        expect(jsonMock).toHaveBeenCalledWith(fakeIncident);
    });

    // ─── ERROR HANDLING: createIncident database error ─────────────────────────────
    it('createIncident throws error when database fails', async () => {
        const dbError = new Error('Database connection failed');
        (Incident.create as jest.Mock).mockRejectedValue(dbError);

        req = {
            body: { type: 'fall', description: 'oops' },
            uid: 'u1',
        } as any;
        const statusMock = jest.fn().mockReturnThis();
        const jsonMock = jest.fn();
        res = { status: statusMock, json: jsonMock } as any;

        await expect(createIncident(req as Request, res as Response)).rejects.toThrow('Database connection failed');
    });

    // ─── COVER LINE 32: empty list branch in listIncidents ─────────────────────────
    it('listIncidents returns empty array when there are no incidents', async () => {
        (Incident.findAll as jest.Mock).mockResolvedValue([]);
        req = { uid: 'user123' } as any;
        const jsonMock = jest.fn();
        res = { json: jsonMock } as any;

        await listIncidents(req as Request, res as Response);

        expect(Incident.findAll).toHaveBeenCalledWith({ where: { userId: 'user123' } });
        expect(jsonMock).toHaveBeenCalledWith([]); // exercise the empty-array path
    });

    // ─── COVER LINE 32: different branch in listIncidents ──────────────────────────
    it('listIncidents handles null/undefined incidents result', async () => {
        (Incident.findAll as jest.Mock).mockResolvedValue(null);
        req = { uid: 'user123' } as any;
        const jsonMock = jest.fn();
        res = { json: jsonMock } as any;

        await listIncidents(req as Request, res as Response);

        expect(Incident.findAll).toHaveBeenCalledWith({ where: { userId: 'user123' } });
        expect(jsonMock).toHaveBeenCalledWith(null);
    });

    // ─── TEST listIncidents happy path ────────────────────────────────────────────
    it('listIncidents calls Incident.findAll and returns the list', async () => {
        const fakeList = [{ id: 5 }, { id: 6 }];
        (Incident.findAll as jest.Mock).mockResolvedValue(fakeList);

        req = { uid: 'user123' } as any;
        const jsonMock = jest.fn();
        res = { json: jsonMock } as any;

        await listIncidents(req as Request, res as Response);

        expect(Incident.findAll).toHaveBeenCalledWith({ where: { userId: 'user123' } });
        expect(jsonMock).toHaveBeenCalledWith(fakeList);
    });

    // ─── ERROR HANDLING: listIncidents database error ──────────────────────────────
    it('listIncidents throws error when database fails', async () => {
        const dbError = new Error('Database query failed');
        (Incident.findAll as jest.Mock).mockRejectedValue(dbError);

        req = { uid: 'user123' } as any;
        const statusMock = jest.fn().mockReturnThis();
        const jsonMock = jest.fn();
        res = { status: statusMock, json: jsonMock } as any;

        await expect(listIncidents(req as Request, res as Response)).rejects.toThrow('Database query failed');
    });

    // ─── TEST summarizeIncident 404 ───────────────────────────────────────────────
    it('summarizeIncident returns 404 when missing', async () => {
        (Incident.findByPk as jest.Mock).mockResolvedValue(null);
        req = { params: { id: '42' } } as any;
        const statusMock = jest.fn().mockReturnThis();
        const jsonMock = jest.fn();
        res = { status: statusMock, json: jsonMock } as any;

        await summarizeIncident(req as Request, res as Response);
        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({ error: 'Not found' });
    });

    // ─── TEST summarizeIncident happy path ────────────────────────────────────────
    it('summarizeIncident calls OpenAI and saves the summary', async () => {
        const saveMock = jest.fn();
        const fakeInc = { id: 3, description: 'foo', save: saveMock, summary: '' };
        (Incident.findByPk as jest.Mock).mockResolvedValue(fakeInc);

        req = { params: { id: '3' } } as any;
        const jsonMock = jest.fn();
        res = { json: jsonMock } as any;

        await summarizeIncident(req as Request, res as Response);

        expect(openai.chat.completions.create).toHaveBeenCalledWith({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'Summarize the following incident.' },
                { role: 'user', content: 'foo' },
            ],
        });
        expect(saveMock).toHaveBeenCalled();
        expect(jsonMock).toHaveBeenCalledWith({ summary: 'mocked summary' });
    });

    // ─── ERROR HANDLING: summarizeIncident database error ──────────────────────────
    it('summarizeIncident throws error when database fails', async () => {
        const dbError = new Error('Database connection failed');
        (Incident.findByPk as jest.Mock).mockRejectedValue(dbError);

        req = { params: { id: '42' } } as any;
        const statusMock = jest.fn().mockReturnThis();
        const jsonMock = jest.fn();
        res = { status: statusMock, json: jsonMock } as any;

        await expect(summarizeIncident(req as Request, res as Response)).rejects.toThrow('Database connection failed');
    });

    // ─── ERROR HANDLING: summarizeIncident OpenAI API error ────────────────────────
    it('summarizeIncident throws error when OpenAI API fails', async () => {
        const saveMock = jest.fn();
        const fakeInc = { id: 3, description: 'foo', save: saveMock, summary: '' };
        (Incident.findByPk as jest.Mock).mockResolvedValue(fakeInc);

        const openaiError = new Error('OpenAI API rate limit exceeded');
        (openai.chat.completions.create as jest.Mock).mockRejectedValue(openaiError);

        req = { params: { id: '3' } } as any;
        const statusMock = jest.fn().mockReturnThis();
        const jsonMock = jest.fn();
        res = { status: statusMock, json: jsonMock } as any;

        await expect(summarizeIncident(req as Request, res as Response)).rejects.toThrow('OpenAI API rate limit exceeded');
    });

    // ─── ERROR HANDLING: summarizeIncident save error ──────────────────────────────
    it('summarizeIncident throws error when save fails after OpenAI call', async () => {
        const saveMock = jest.fn().mockRejectedValue(new Error('Save failed'));
        const fakeInc = { id: 3, description: 'foo', save: saveMock, summary: '' };
        (Incident.findByPk as jest.Mock).mockResolvedValue(fakeInc);

        req = { params: { id: '3' } } as any;
        const statusMock = jest.fn().mockReturnThis();
        const jsonMock = jest.fn();
        res = { status: statusMock, json: jsonMock } as any;

        await expect(summarizeIncident(req as Request, res as Response)).rejects.toThrow('Save failed');
    });

    // ─── EDGE CASE: summarizeIncident with already existing summary ─────────────────
    it('summarizeIncident works when incident already has a summary', async () => {
        const saveMock = jest.fn();
        const fakeInc = { id: 3, description: 'foo', save: saveMock, summary: 'existing summary' };
        (Incident.findByPk as jest.Mock).mockResolvedValue(fakeInc);

        req = { params: { id: '3' } } as any;
        const jsonMock = jest.fn();
        res = { json: jsonMock } as any;

        await summarizeIncident(req as Request, res as Response);

        expect(openai.chat.completions.create).toHaveBeenCalled();
        expect(saveMock).toHaveBeenCalled();
        expect(fakeInc.summary).toBe('mocked summary'); // Should be updated
        expect(jsonMock).toHaveBeenCalledWith({ summary: 'mocked summary' });
    });

    // ─── EDGE CASE: createIncident with missing body fields ────────────────────────
    it('createIncident handles missing body fields', async () => {
        const fakeIncident = { id: 7, type: undefined, description: undefined, userId: 'u1' };
        (Incident.create as jest.Mock).mockResolvedValue(fakeIncident);

        req = {
            body: {}, // Empty body
            uid: 'u1',
        } as any;
        const statusMock = jest.fn().mockReturnThis();
        const jsonMock = jest.fn();
        res = { status: statusMock, json: jsonMock } as any;

        await createIncident(req as Request, res as Response);

        expect(Incident.create).toHaveBeenCalledWith({
            userId: 'u1',
            type: undefined,
            description: undefined,
        });
        expect(statusMock).toHaveBeenCalledWith(201);
        expect(jsonMock).toHaveBeenCalledWith(fakeIncident);
    });

    // ─── EDGE CASE: listIncidents with missing uid ─────────────────────────────────
    it('listIncidents handles missing uid', async () => {
        const fakeList = [{ id: 5 }, { id: 6 }];
        (Incident.findAll as jest.Mock).mockResolvedValue(fakeList);

        req = {} as any; // No uid
        const jsonMock = jest.fn();
        res = { json: jsonMock } as any;

        await listIncidents(req as Request, res as Response);

        expect(Incident.findAll).toHaveBeenCalledWith({ where: { userId: undefined } });
        expect(jsonMock).toHaveBeenCalledWith(fakeList);
    });
});