import { useMemo } from 'react'
import { 
  ComputerDesktopIcon, 
  ExclamationTriangleIcon, 
  BellAlertIcon, 
  ChartBarIcon, 
  CircleStackIcon 
} from './Icons'

export default function KPICards({ overview, machines }) {
  if (!overview) return null

  // Memoized calculations for performance
  const metrics = useMemo(() => {
    // Use ML prediction high-risk count if available
    const highRiskMachines = overview.highRiskMachines !== undefined 
      ? overview.highRiskMachines
      : machines.filter(m => {
          const cpu = parseFloat(m.cpu_usage)
          const memory = parseFloat(m.memory_usage)
          const disk = parseFloat(m.disk_usage)
          return cpu >= 80 || memory >= 80 || disk >= 80
        }).length

    const criticalDisks = machines.filter(m => 
      m.health_status === 'CRITICAL' || m.health_status === 'WARNING'
    ).length

    // Calculate average failure probability from ML predictions
    const machinesWithPredictions = machines.filter(m => m.prediction && m.prediction.failure_probability_30d)
    const failurePrediction = machinesWithPredictions.length > 0
      ? (machinesWithPredictions.reduce((sum, m) => sum + parseFloat(m.prediction.failure_probability_30d), 0) / machinesWithPredictions.length).toFixed(1)
      : '0.0'

    return { highRiskMachines, criticalDisks, failurePrediction }
  }, [overview, machines])

  const cards = [
    {
      title: 'PCs Surveillés',
      value: overview.totalMachines,
      icon: ComputerDesktopIcon,
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400'
    },
    {
      title: 'PCs à Haut Risque',
      value: metrics.highRiskMachines,
      icon: ExclamationTriangleIcon,
      gradient: 'from-red-500 to-pink-500',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      alert: metrics.highRiskMachines > 0
    },
    {
      title: 'Alertes Actives',
      value: overview.criticalAlerts,
      icon: BellAlertIcon,
      gradient: 'from-yellow-500 to-orange-500',
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400'
    },
    {
      title: 'Prédictions Pannes (30j)',
      value: `${metrics.failurePrediction}%`,
      icon: ChartBarIcon,
      gradient: 'from-purple-500 to-indigo-500',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400'
    },
    {
      title: 'Disques Critiques',
      value: metrics.criticalDisks,
      icon: CircleStackIcon,
      gradient: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-400'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div 
            key={index} 
            className={`relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 transform hover:scale-105 hover:bg-white/15 transition-all duration-300 ${
              card.alert ? 'ring-2 ring-red-400 shadow-lg shadow-red-500/50' : 'shadow-xl'
            }`}
          >
            {card.alert && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
            
            <div className="flex items-start justify-between mb-4">
              <div className={`${card.iconBg} p-3 rounded-xl`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
            
            <p className="text-sm font-medium text-gray-300 mb-2">{card.title}</p>
            <p className={`text-4xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
              {card.value}
            </p>
          </div>
        )
      })}
    </div>
  )
}
