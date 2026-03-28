import { useState, useEffect } from 'react'
import axios from 'axios'
import Dashboard from './Dashboard'

const API_URL = 'http://localhost:3000/api/dashboard'

function DashboardWrapper() {
  const [overview, setOverview] = useState(null)
  const [machines, setMachines] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000) // Refresh every 60 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchLSTMPrediction = async (machineId) => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(
        `http://localhost:3000/api/ml/lstm/predict/${machineId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return res.data
    } catch (err) {
      if (machineId === 1) {
        // Log once to help debug — check browser console for the actual error
        console.warn(`[LSTM] predict failed for machine ${machineId}:`, err.response?.status, err.response?.data || err.message)
      }
      return null
    }
  }

  const fetchData = async () => {
    try {
      setIsRefreshing(true)
      const [overviewRes, machinesRes, alertsRes] = await Promise.all([
        axios.get(`${API_URL}/overview`),
        axios.get(`${API_URL}/machines`),
        axios.get(`${API_URL}/alerts?hours=24`)
      ])

      // Attach LSTM predictions to each machine
      const machinesWithPredictions = await Promise.all(
        machinesRes.data.map(async (machine) => {
          const lstm = await fetchLSTMPrediction(machine.id)
          return { ...machine, lstmPrediction: lstm }
        })
      )

      setOverview(overviewRes.data)
      setMachines(machinesWithPredictions)
      setAlerts(alertsRes.data)
      setLastUpdate(new Date())
      setLoading(false)
      setIsRefreshing(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError(error.message)
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-xl text-white">Chargement...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="text-xl text-red-400 mb-4">Erreur de connexion</div>
          <div className="text-gray-300 mb-4">{error}</div>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <Dashboard 
      overview={overview}
      machines={machines}
      alerts={alerts}
      onRefresh={fetchData}
      lastUpdate={lastUpdate}
      isRefreshing={isRefreshing}
    />
  )
}

export default DashboardWrapper
