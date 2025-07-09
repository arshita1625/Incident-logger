// backend/__tests__/incidentController.test.ts

// Ensure the controller doesn’t choke on a missing API key in normal tests
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
});
