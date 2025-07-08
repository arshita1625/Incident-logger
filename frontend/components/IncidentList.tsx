// frontend/components/IncidentList.tsx
import { useEffect, useState } from 'react';
import Loader from './Loader';

interface Incident {
  id: number;
  type: string;
  description: string;
  summary?: string;
}

interface Props {
  token?: string;
  refresh: number;   // changed
}

export default function IncidentList({ token, refresh }: Props) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/incidents`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIncidents(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, refresh]);  // re-run on `refresh`

  const summarize = async (id: number) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/incidents/${id}/summarize`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      );
      const { summary } = await res.json();
      setIncidents(prev => prev.map(i => i.id === id ? { ...i, summary } : i));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {loading && <Loader />}
      {incidents.map(inc => (
        <div key={inc.id} className="border p-2 mb-2">
          <h2 className="font-bold">{inc.type}</h2>
          <p>{inc.description}</p>
          <button
            onClick={() => summarize(inc.id)}
            disabled={loading}
            className="mt-1 text-sm text-blue-600 disabled:opacity-50"
          >
            {loading ? 'Summarizing...' : 'Summarize'}
          </button>
          {inc.summary && <p className="mt-1 italic">{inc.summary}</p>}
        </div>
      ))}
    </div>
  );
}
