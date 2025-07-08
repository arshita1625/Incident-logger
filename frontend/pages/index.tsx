import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import IncidentForm from '../components/IncidentForm';
import IncidentList from '../components/IncidentList';

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  if (!user) return <button onClick={login}>Login with Google</button>;
  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Incident Logger</h1>
      <IncidentForm token={await auth.currentUser?.getIdToken()} />
      <IncidentList token={await auth.currentUser?.getIdToken()} />
    </div>
  );
}