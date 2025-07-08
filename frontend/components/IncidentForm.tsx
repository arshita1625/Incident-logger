// frontend/components/IncidentForm.tsx
import { useState } from 'react';
import Loader from './Loader';

interface Props {
  token?: string;
  onSuccess: () => void;
}

export default function IncidentForm({ token, onSuccess }: Props) {
  const [type, setType] = useState('fall');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, description }),
      });
      setDescription('');
      onSuccess();   // trigger list reload
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 relative">
      {loading && <Loader />}
      <select value={type} onChange={e => setType(e.target.value)} disabled={loading} className="border p-2 mr-2">
        <option value="fall">Fall</option>
        <option value="behaviour">Behaviour</option>
        <option value="medication">Medication</option>
      </select>
      <textarea
        className="border p-2 w-full mt-2"
        value={description}
        onChange={e => setDescription(e.target.value)}
        disabled={loading}
      />
      <button
        onClick={submit}
        disabled={loading}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Logging...' : 'Log Incident'}
      </button>
    </div>
  );
}
