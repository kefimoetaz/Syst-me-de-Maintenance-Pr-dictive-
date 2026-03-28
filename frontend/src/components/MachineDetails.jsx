import { useState, useEffect } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function MachineDetails({ machine, onClose, onRefresh }) {
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [hours, setHours] = useState(24)
  const [anomalies, setAnomalies] = useState([])

  // Edit / Delete state
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState({ hostname: machine.hostname, ip_address: machine.ip_address })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.role === 'admin'
  const token = localStorage.getItem('token')

  useEffect(() => { fetchMetrics() }, [machine.id, hours])

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/dashboard/machines/${machine.id}/metrics?hours=${hours}`
      )
      setMetrics(response.data.metrics)
      setAnomalies(response.data.anomalies || [])
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (s) => ({ CRITICAL:'#ef4444', HIGH:'#f97316', MEDIUM:'#eab308', LOW:'#22c55e' }[s] || '#9ca3af')

  const handleEdit = async (e) => {
    e.preventDefault()
    setEditLoading(true)
    setEditError('')
    try {
      await axios.put(`http://localhost:3000/api/machines/${machine.id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      machine.hostname   = editForm.hostname
      machine.ip_address = editForm.ip_address
      setShowEdit(false)
      if (onRefresh) onRefresh()
    } catch (err) {
      setEditError(err.response?.data?.message || 'Erreur lors de la mise à jour')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await axios.delete(`http://localhost:3000/api/machines/${machine.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      onClose()
      if (onRefresh) onRefresh()
    } catch (err) {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
      alert(err.response?.data?.message || 'Erreur lors de la suppression')
    }
  }
  const getRiskColor    = (r) => ({ HIGH:'#ef4444', MEDIUM:'#f97316', LOW:'#22c55e' }[r] || '#9ca3af')
  const getRiskScore    = (r) => ({ HIGH:85, MEDIUM:50, LOW:15 }[r] || 0)

  const formatData = () => metrics.map(m => ({
    time: new Date(m.created_at).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }),
    CPU: parseFloat(m.cpu_usage),
    Mémoire: parseFloat(m.memory_usage),
    Disque: parseFloat(m.disk_usage)
  }))

  const lstm      = machine.lstmPrediction
  const riskScore = lstm ? getRiskScore(lstm.risk_level) : 0
  const riskColor = lstm ? getRiskColor(lstm.risk_level) : '#9ca3af'

  // Custom chart tooltip
  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-white text-xs shadow-xl">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value?.toFixed(1)}%</p>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl shadow-purple-900/50 max-w-6xl w-full max-h-[90vh] flex flex-col relative">

        {/* Header — fixed */}
        <div className="px-6 py-4 border-b border-white/20 flex justify-between items-center bg-white/20 backdrop-blur-md rounded-t-2xl flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">{machine.hostname}</h2>
            <p className="text-sm text-gray-300">{machine.ip_address} · {machine.os}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Edit button */}
            <button
              onClick={() => { setEditForm({ hostname: machine.hostname, ip_address: machine.ip_address }); setShowEdit(true) }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-medium rounded-lg transition-all shadow-lg shadow-purple-500/30"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier
            </button>
            {/* Delete button — admin only */}
            {isAdmin && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-medium rounded-lg transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Supprimer
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl w-9 h-9 flex items-center justify-center text-2xl transition-all"
            >×</button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[78vh] px-6 py-5 space-y-5 custom-scrollbar">

          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label:'CPU',     value: machine.cpu_usage,    color:'text-blue-400',   bg:'bg-blue-500/10',   border:'border-blue-500/20' },
              { label:'Mémoire', value: machine.memory_usage, color:'text-green-400',  bg:'bg-green-500/10',  border:'border-green-500/20' },
              { label:'Disque',  value: machine.disk_usage,   color:'text-purple-400', bg:'bg-purple-500/10', border:'border-purple-500/20' },
            ].map(({ label, value, color, bg, border }) => (
              <div key={label} className={`${bg} border ${border} rounded-xl p-4 backdrop-blur-sm`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${color} mb-1`}>{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{parseFloat(value).toFixed(1)}%</p>
              </div>
            ))}
          </div>

          {/* LSTM Prediction */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4">Prédiction LSTM — Risque de Panne</h3>
            {!lstm ? (
              <p className="text-gray-400 text-sm">Prédiction indisponible</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gauge */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-44 h-44">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                      <circle cx="50" cy="50" r="40" fill="none"
                        stroke={riskColor} strokeWidth="8"
                        strokeDasharray={`${(riskScore / 100) * 251.2} 251.2`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold" style={{ color: riskColor }}>
                        {Math.round((lstm.prediction ?? 0) * 100)}%
                      </span>
                      <span className="text-xs text-gray-400">Probabilité</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-4 py-1.5 rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: riskColor }}>
                      {lstm.risk_level}
                    </span>
                    {lstm.anomaly && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                        Anomalie
                      </span>
                    )}
                  </div>
                </div>

                {/* Explanation */}
                <div className="flex flex-col justify-center space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Analyse LSTM</h4>
                    <p className="text-sm text-gray-300 bg-white/5 border-l-4 rounded-lg p-4"
                      style={{ borderLeftColor: riskColor }}>
                      {lstm.explanation}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">Score de risque</p>
                      <p className="text-xl font-bold" style={{ color: riskColor }}>
                        {Math.round((lstm.prediction ?? 0) * 100)}%
                      </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">Modèle</p>
                      <p className="text-sm font-semibold text-purple-400">LSTM</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Anomalies */}
          {anomalies.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4">Anomalies Détectées (7 derniers jours)</h3>
              <div className="space-y-3">
                {anomalies.map((anomaly, i) => (
                  <div key={i}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 border-l-4"
                    style={{ borderLeftColor: getSeverityColor(anomaly.severity) }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: getSeverityColor(anomaly.severity) }}>
                            {anomaly.severity}
                          </span>
                          <span className="text-sm font-semibold text-white">
                            {anomaly.anomaly_type.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                          <span>Métrique: <span className="text-white font-medium">{anomaly.metric_name.replace(/_/g, ' ').toUpperCase()}</span></span>
                          <span>Valeur: <span className="text-white font-medium">{typeof anomaly.metric_value === 'number' ? anomaly.metric_value.toFixed(2) : anomaly.metric_value}</span></span>
                          <span>Plage: <span className="text-white font-medium">{anomaly.expected_range || 'N/A'}</span></span>
                          <span>Score: <span className="text-white font-medium">{anomaly.anomaly_score ? anomaly.anomaly_score.toFixed(1) : 'N/A'}</span></span>
                        </div>
                      </div>
                      <div className="ml-4 text-right text-xs text-gray-400">
                        <p>{new Date(anomaly.detected_at).toLocaleDateString('fr-FR')}</p>
                        <p>{new Date(anomaly.detected_at).toLocaleTimeString('fr-FR')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time range + Chart */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Métriques système</h3>
              <div className="flex gap-2">
                {[6, 12, 24, 48].map(h => (
                  <button key={h} onClick={() => setHours(h)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      hours === h
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                    }`}>
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay:'0.15s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay:'0.3s' }}></div>
                  <span className="ml-2 text-sm">Chargement...</span>
                </div>
              </div>
            ) : metrics.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                Aucune donnée disponible
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={formatData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="time" tick={{ fill:'#d1d5db', fontSize:11 }} axisLine={{ stroke:'rgba(255,255,255,0.15)' }} tickLine={false} />
                  <YAxis domain={[0,100]} tick={{ fill:'#d1d5db', fontSize:11 }} axisLine={{ stroke:'rgba(255,255,255,0.15)' }} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ color:'#d1d5db', fontSize:'12px' }} />
                  <Line type="monotone" dataKey="CPU"     stroke="#60a5fa" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Mémoire" stroke="#34d399" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Disque"  stroke="#a78bfa" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Machine info */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Informations</h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {[
                ['Numéro de série', <span className="font-mono text-purple-300">{machine.serial_number}</span>],
                ['Système',         <span className="text-white">{machine.os}</span>],
                ['Statut',          <span className="text-white capitalize">{machine.status}</span>],
                ['Santé disque',    <span className="text-white">{machine.health_status}</span>],
              ].map(([label, val], i) => (
                <div key={i} className="flex gap-2">
                  <dt className="text-gray-400 flex-shrink-0">{label}:</dt>
                  <dd>{val}</dd>
                </div>
              ))}
            </dl>
          </div>

        </div>
      </div>

      {/* ── Edit Modal ─────────────────────────────────────────────────── */}
      {showEdit && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Modifier la machine</h3>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-300 font-medium uppercase tracking-wide">Hostname</label>
                <input
                  type="text"
                  value={editForm.hostname}
                  onChange={e => setEditForm(f => ({ ...f, hostname: e.target.value }))}
                  className="mt-1 w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-300 font-medium uppercase tracking-wide">Adresse IP</label>
                <input
                  type="text"
                  value={editForm.ip_address}
                  onChange={e => setEditForm(f => ({ ...f, ip_address: e.target.value }))}
                  className="mt-1 w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                  required
                />
              </div>
              {editError && <p className="text-red-400 text-xs">{editError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={editLoading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl py-2.5 transition-all shadow-lg shadow-purple-500/30">
                  {editLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button type="button" onClick={() => setShowEdit(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl py-2.5 border border-white/20 transition-all">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ─────────────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Supprimer la machine ?</h3>
            <p className="text-sm text-gray-300 mb-6">
              Cette action est irréversible. La machine <span className="text-white font-semibold">{machine.hostname}</span> et toutes ses données seront supprimées.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleteLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl py-2.5 transition-all">
                {deleteLoading ? 'Suppression...' : 'Supprimer'}
              </button>
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl py-2.5 border border-white/20 transition-all">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
