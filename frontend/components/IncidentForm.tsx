import { useState } from 'react';

interface Props { token: string | undefined; }

export default function IncidentForm({ token }: Props) {
  const [type, setType] = useState('fall');
  const [description, setDescription] = useState('');

  const submit = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ type, description }),
    });
    setDescription('');
  };

  return (
    <div className="mb-4">
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="fall">Fall</option>
        <option value="behaviour">Behaviour</option>
        <option value="medication">Medication</option>
      </select>
      <textarea
        className="border p-2 w-full"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={submit}>
        Log Incident
      </button>
    </div>
  );
}