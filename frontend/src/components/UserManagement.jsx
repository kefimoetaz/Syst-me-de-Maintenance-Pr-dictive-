import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3000';

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user' });
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/api/users`, { headers });
      setUsers(res.data.users || res.data);
    } catch {
      setError('Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await axios.post(`${API}/api/users`, form, { headers });
      setForm({ username: '', email: '', password: '', role: 'user' });
      setShowForm(false);
      setSuccess('Utilisateur créé avec succès.');
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Échec de la création.');
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`${API}/api/users/${userId}/role`, { role: newRole }, { headers });
      setSuccess('Rôle mis à jour.');
      setTimeout(() => setSuccess(''), 2000);
      fetchUsers();
    } catch {
      setError('Échec de la mise à jour du rôle.');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await axios.delete(`${API}/api/users/${userId}`, { headers });
      setSuccess('Utilisateur supprimé.');
      setTimeout(() => setSuccess(''), 2000);
      fetchUsers();
    } catch {
      setError('Échec de la suppression.');
    }
  };

  const roleBadge = (role) => role === 'admin'
    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">Gestion des Utilisateurs</p>
              <p className="text-xs text-slate-400 mt-0.5">Administration du système</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowForm(!showForm)}
              className="h-8 flex items-center gap-1.5 px-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-medium rounded-lg shadow-lg shadow-purple-500/30 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Nouvel utilisateur</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="h-8 flex items-center gap-1.5 px-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg border border-white/10 text-xs font-medium transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Tableau de bord</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        {/* Notifications */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 flex items-center justify-between text-red-300">
            <div className="flex items-center space-x-3">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-200 text-xs">✕</button>
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-3 flex items-center space-x-3 text-green-300">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
            <h2 className="text-base font-semibold text-white mb-5">Créer un nouvel utilisateur</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Nom d'utilisateur</label>
                <input
                  placeholder="ex: jean.dupont"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Adresse email</label>
                <input
                  placeholder="ex: jean@exemple.com"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Mot de passe</label>
                <input
                  placeholder="••••••••"
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Rôle</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all"
                >
                  <option value="user">Technicien</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-all border border-white/10 text-sm">
                  Annuler
                </button>
                <button type="submit" disabled={creating} className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg transition-all text-sm font-medium disabled:opacity-50 shadow-lg shadow-purple-500/30">
                  {creating ? 'Création...' : 'Créer l\'utilisateur'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total utilisateurs', value: users.length, color: 'from-blue-500 to-cyan-500', iconBg: 'bg-blue-500/20', iconColor: 'text-blue-400', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
            { label: 'Administrateurs', value: users.filter(u => u.role === 'admin').length, color: 'from-purple-500 to-indigo-500', iconBg: 'bg-purple-500/20', iconColor: 'text-purple-400', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
            { label: 'Techniciens', value: users.filter(u => u.role !== 'admin').length, color: 'from-orange-500 to-red-500', iconBg: 'bg-orange-500/20', iconColor: 'text-orange-400', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
          ].map(stat => (
            <div key={stat.label} className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.iconBg} p-3 rounded-xl`}>
                  <svg className={`w-6 h-6 ${stat.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-300 mb-2">{stat.label}</p>
              <p className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
            <h2 className="text-sm font-semibold text-white">Liste des techniciens et administrateurs</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg className="animate-spin h-7 w-7 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Créé le</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {(user.username || 'U')[0].toUpperCase()}
                        </div>
                        <span className="text-white text-sm">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{user.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={e => handleRoleChange(user.id, e.target.value)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${roleBadge(user.role)} bg-transparent border-0`}
                      >
                        <option value="user" className="bg-slate-800 text-white">Technicien</option>
                        <option value="admin" className="bg-slate-800 text-white">Administrateur</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.id !== currentUser.id && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="px-3 py-1.5 bg-white/5 text-gray-400 border border-white/10 rounded-lg hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/20 transition-all text-xs"
                        >
                          Supprimer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
