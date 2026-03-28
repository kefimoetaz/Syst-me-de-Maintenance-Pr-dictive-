import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import KPICards from './KPICards'
import MachineList from './MachineList'
import AlertsList from './AlertsList'
import MachineDetails from './MachineDetails'
import SystemHealthChart from './SystemHealthChart'
import ModelPerformance from './ModelPerformance'
import Chatbot from './Chatbot'
import { MagnifyingGlassIcon, ArrowPathIcon, UserCircleIcon, ServerIcon, CpuChipIcon } from './Icons'
import { exportMachines, exportAlerts } from '../utils/exportCSV'

export default function Dashboard({ overview, machines, alerts, onRefresh, lastUpdate, isRefreshing }) {
  const navigate = useNavigate()
  const [selectedMachine, setSelectedMachine] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModelPerformance, setShowModelPerformance] = useState(false)

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  // Memoized filtered machines for performance
  const filteredMachines = useMemo(() => {
    if (!searchQuery.trim()) return machines
    
    const query = searchQuery.toLowerCase()
    return machines.filter(m => 
      m.hostname.toLowerCase().includes(query) ||
      m.ip_address.includes(query) ||
      m.serial_number.toLowerCase().includes(query)
    )
  }, [machines, searchQuery])

  // Callback for machine selection
  const handleSelectMachine = useCallback((machine) => {
    setSelectedMachine(machine)
  }, [])

  const handleCloseDetails = useCallback(() => {
    setSelectedMachine(null)
  }, [])

  const formatLastUpdate = () => {
    const now = new Date()
    return now.toLocaleString('fr-FR', { 
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-[1920px] mx-auto px-6 h-16 grid grid-cols-3 items-center gap-4">

          {/* LEFT — Brand */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
              <ServerIcon className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white leading-none truncate">PC Technician</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {isRefreshing ? (
                  <span className="text-blue-400">Actualisation…</span>
                ) : lastUpdate ? (
                  `Mis à jour ${lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                ) : '—'}
              </p>
            </div>
          </div>

          {/* CENTER — Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher un PC, IP, numéro de série…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition-all"
            />
          </div>

          {/* RIGHT — Actions */}
          <div className="flex items-center justify-end space-x-1.5">

            {/* Refresh */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Actualiser"
              className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Export CSV — dropdown */}
            <div className="relative group">
              <button className="h-8 flex items-center gap-1.5 px-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:text-white text-gray-300 text-xs font-medium rounded-lg transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export</span>
                <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 mt-1 w-44 bg-slate-800/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <button onClick={() => exportMachines(machines)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all">
                  <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V9l-6-6zM9 3v6h6" />
                  </svg>
                  Machines ({machines.length})
                </button>
                <button onClick={() => exportAlerts(alerts)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all border-t border-white/5">
                  <svg className="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  Alertes ({alerts.length})
                </button>
              </div>
            </div>

            {/* Modèles ML */}
            <button
              onClick={() => setShowModelPerformance(true)}
              className="h-8 flex items-center gap-1.5 px-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-medium rounded-lg shadow-lg shadow-purple-500/30 transition-all"
            >
              <CpuChipIcon className="w-3.5 h-3.5" />
              <span>Modèles ML</span>
            </button>

            {/* Admin */}
            {user.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/users')}
                title="Gestion des utilisateurs"
                className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}

            {/* Divider */}
            <div className="w-px h-6 bg-white/10" />

            {/* User menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-all">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {(user.full_name || user.email || 'U')[0].toUpperCase()}
                </div>
                <div className="text-left hidden xl:block">
                  <p className="text-xs font-medium text-white leading-none">{user.full_name || user.email || 'Utilisateur'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</p>
                </div>
              </button>
              <div className="absolute right-0 mt-1 w-44 bg-slate-800 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-8 py-8">
        {/* KPI Cards */}
        <section className="mb-8">
          <KPICards overview={overview} machines={machines} />
        </section>

        {/* Charts & Alerts Row */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* System Health Chart */}
          <div className="xl:col-span-1">
            <SystemHealthChart machines={machines} />
          </div>

          {/* Alerts Feed */}
          <div className="xl:col-span-2">
            <AlertsList alerts={alerts.slice(0, 6)} />
          </div>
        </section>

        {/* Critical Machines Table */}
        <section>
          <MachineList 
            machines={filteredMachines}
            onSelectMachine={handleSelectMachine}
            selectedMachine={selectedMachine}
          />
        </section>

        {/* Machine Details Modal */}
        {selectedMachine && (
          <MachineDetails
            machine={selectedMachine}
            onClose={handleCloseDetails}
            onRefresh={onRefresh}
          />
        )}

        {/* Model Performance Modal */}
        {showModelPerformance && (
          <ModelPerformance
            onClose={() => setShowModelPerformance(false)}
          />
        )}
      </main>

      {/* AI Chatbot */}
      <Chatbot />
    </div>
  )
}
