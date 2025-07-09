// frontend/__tests__/IncidentForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IncidentForm from '../components/IncidentForm';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4000/api';
describe('IncidentForm', () => {
    const fakeToken = 'tok';
    const onSuccess = jest.fn();

    beforeEach(() => {
        // Mock fetch to resolve after a tick
        (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });
        onSuccess.mockClear();
    });

    it('submits and clears the textarea', async () => {
        render(<IncidentForm token={fakeToken} onSuccess={onSuccess} />);

        // Type into the textarea
        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: 'A new incident' },
        });
        expect(screen.getByRole('textbox')).toHaveValue('A new incident');

        // Click submit
        fireEvent.click(screen.getByRole('button', { name: /log incident/i }));

        // Wait for the textarea to clear
        await waitFor(() => {
            expect(screen.getByRole('textbox')).toHaveValue('');
        });

        // onSuccess should have been called
        expect(onSuccess).toHaveBeenCalledTimes(1);

        // And fetch was invoked with the correct args
        expect(global.fetch).toHaveBeenCalledWith(
            'http://localhost:4000/api/incidents',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    Authorization: `Bearer ${fakeToken}`,
                }),
                body: JSON.stringify({ type: 'fall', description: 'A new incident' }),
            })
        );
    });
});
