// __tests__/IncidentForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IncidentForm from '../components/IncidentForm';

describe('IncidentForm additional branches', () => {
    const fakeToken = 'tok';
    let onSuccess: jest.Mock;

    beforeEach(() => {
        onSuccess = jest.fn();
        (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });
    });

    it('updates the description textarea on user input', () => {
        render(<IncidentForm token={fakeToken} onSuccess={onSuccess} />);
        const textarea = screen.getByRole('textbox');
        fireEvent.change(textarea, { target: { value: 'My description' } });
        expect(textarea).toHaveValue('My description');
    });

    it('lets you pick a different incident type and sends it in the POST body', async () => {
        render(<IncidentForm token={fakeToken} onSuccess={onSuccess} />);

        // change the <select> from its default "fall" to "medication"
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'medication' } });
        expect(select).toHaveValue('medication');

        // click Log Incident
        const btn = screen.getByRole('button', { name: /log incident/i });
        fireEvent.click(btn);

        await waitFor(() => {
            // ensure fetch was called with the updated type
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/incidents'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ type: 'medication', description: '' }),
                })
            );
        });

        // and onSuccess should have been called exactly once
        expect(onSuccess).toHaveBeenCalledTimes(1);
    });
});