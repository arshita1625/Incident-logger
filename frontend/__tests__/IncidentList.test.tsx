import { render, screen, fireEvent } from '@testing-library/react';
import IncidentList from '../components/IncidentList';

describe('IncidentList', () => {
    const token = 'tok';
    const incidentsData = [{ id: 1, type: 'fall', description: 'desc' }];

    beforeEach(() => {
        (global.fetch as jest.Mock) = jest
            .fn()
            .mockResolvedValueOnce({ ok: true, json: async () => incidentsData })   // initial GET
            .mockResolvedValueOnce({ ok: true, json: async () => ({ summary: 'short summary' }) }); // summarize
    });

    it('loads and displays incidents, then summarizes one', async () => {
        render(<IncidentList token={token} refresh={0} />);

        // findByText wraps in act and waits for GET to finish
        expect(await screen.findByText('fall')).toBeInTheDocument();

        // click summarize
        fireEvent.click(screen.getByText(/summarize/i));

        // wait for loader
        expect(await screen.findByTestId('loader-overlay')).toBeInTheDocument();

        // wait for summary text
        expect(await screen.findByText('short summary')).toBeInTheDocument();
    });
});
