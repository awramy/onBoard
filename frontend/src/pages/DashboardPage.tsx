import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { getTechnologies } from '../api/technologies';
import { getSessions, createSession } from '../api/sessions';
import type { Technology, InterviewSession } from '../types';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([getTechnologies(), getSessions()])
      .then(([techRes, sessRes]) => {
        setTechnologies(techRes.data);
        setSessions(sessRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreateSession = async (levelId: string) => {
    setCreating(true);
    try {
      const { data } = await createSession(levelId, { format: 'text-text', questions_count: 5 });
      setSessions((prev) => [data, ...prev]);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-400">onBoard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Welcome, {user?.username}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Technologies</h2>
          {technologies.length === 0 ? (
            <div className="bg-gray-800 p-6 rounded-xl text-center">
              <p className="text-gray-400 mb-2">No technologies available yet.</p>
              <p className="text-gray-500 text-sm">
                Technologies and their levels need to be seeded in the database.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {technologies.map((tech) => (
                <div key={tech.id} className="bg-gray-800 p-4 rounded-xl">
                  <h3 className="text-lg font-medium mb-2">{tech.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{tech.description}</p>
                  <div className="flex gap-2">
                    {tech.levels.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => handleCreateSession(level.id)}
                        disabled={creating}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded text-sm transition-colors"
                      >
                        {level.difficulty}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Your Sessions</h2>
          {sessions.length === 0 ? (
            <div className="bg-gray-800 p-6 rounded-xl text-center">
              <p className="text-gray-400">No sessions yet. Start one by selecting a technology above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="bg-gray-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-indigo-400 font-medium">
                      {session.technologyLevel?.technology?.name}
                    </span>
                    <span className="text-gray-400 mx-2">·</span>
                    <span className="text-gray-300">{session.technologyLevel?.difficulty}</span>
                    <span className="text-gray-400 mx-2">·</span>
                    <span className="text-sm text-gray-500">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      session.status === 'completed'
                        ? 'bg-green-900/50 text-green-400'
                        : session.status === 'in_progress'
                          ? 'bg-yellow-900/50 text-yellow-400'
                          : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
