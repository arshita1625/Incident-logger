// backend/__tests__/incidentController.test.ts
process.env.OPENAI_API_KEY = 'test‐key';
import { summarizeIncident, openai } from '../src/controllers/incidentController';
import { Incident } from '../src/models/incident';
import { Request, Response } from 'express';

// Mock the model
jest.mock('../src/models/incident', () => ({
    Incident: {
        findByPk: jest.fn(),
    },
}));

describe('summarizeIncident', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        // Clear any previous mock on the chat API
        jest.resetAllMocks();

        // Stub the OpenAI call on our exported instance
        (openai.chat.completions.create as jest.Mock) = jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'mocked summary' } }],
        });
    });

    it('returns 404 if incident not found', async () => {
        (Incident.findByPk as jest.Mock).mockResolvedValue(null);
        req = { params: { id: '42' } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await summarizeIncident(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
    });

    it('calls OpenAI and saves summary', async () => {
        const saveMock = jest.fn();
        const fakeIncident = { id: 1, description: 'foo', save: saveMock, summary: '' };
        (Incident.findByPk as jest.Mock).mockResolvedValue(fakeIncident);

        req = { params: { id: '1' } };
        res = { json: jest.fn() };

        await summarizeIncident(req as Request, res as Response);

        // Our stub should have been called
        expect(openai.chat.completions.create).toHaveBeenCalledWith({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'Summarize the following incident.' },
                { role: 'user', content: 'foo' },
            ],
        });

        // Ensure the incident got saved with the mocked summary
        expect(saveMock).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ summary: 'mocked summary' });
    });
});
