import { useEffect, useState } from 'react';

interface Incident { id: number; type: string; description: string; summary?: string; }
interface Props { token: string | undefined; }

export default function IncidentList({ token }: Props) {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/incidents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncidents(await res.json());
    })();
  }, [token]);

  const summarize = async (id: number) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/incidents/${id}/summarize`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const { summary } = await res.json();
    setIncidents((prev) => prev.map(i => i.id === id ? { ...i, summary } : i));
  };

  return (
    <div>
      {incidents.map((inc) => (
        <div key={inc.id} className="border p-2 mb-2">
          <h2 className="font-bold">{inc.type}</h2>
          <p>{inc.description}</p>
          <button className="mt-1 text-sm text-blue-600" onClick={() => summarize(inc.id)}>
            Summarize
          </button>
          {inc.summary && <p className="mt-1 italic">{inc.summary}</p>}
        </div>
      ))}
    </div>
  );
}