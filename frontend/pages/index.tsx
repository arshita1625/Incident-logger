// frontend/pages/index.tsx
import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import Loader from '../components/Loader';
import IncidentForm from '../components/IncidentForm';
import IncidentList from '../components/IncidentList';
import { FcGoogle } from 'react-icons/fc';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>();
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This triggers a reload of the list
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u);
      if (u) setToken(await u.getIdToken());
      setInitializing(false);
    });
    return unsub;
  }, []);

  const login = async () => {
    setError(null);
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (e: any) { setError(e.message); }
  };
  const logout = () => signOut(auth);

  if (initializing) {
    return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
  }
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-4">Welcome Back</h1>
          <p className="text-center text-gray-600 mb-6">
            Sign in with Google to continue
          </p>
          {error && (
            <div className="text-red-500 text-sm mb-4 text-center">
              {error}
            </div>
          )}
          <button
            onClick={login}
            className="w-full flex items-center justify-center border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition"
          >
            <FcGoogle className="h-6 w-6 mr-3" />
            <span className="font-medium text-gray-700">
              Continue with Google
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <span>Hello, {user.displayName || user.email}</span>
        <button onClick={logout} className="px-3 py-1 bg-red-100 text-red-600 rounded">Logout</button>
      </div>
      <h1 className="text-xl font-semibold mb-4">Incident Logger</h1>
      {/* pass down a callback to bump `refresh` */}
      <IncidentForm
        token={token}
        onSuccess={() => setRefresh(r => r + 1)}
      />
      {/* pass `refresh` so list reloads whenever it changes */}
      <IncidentList token={token} refresh={refresh} />
    </div>
  );
}
