import { ShieldExclamationIcon, ExclamationTriangleIcon, CheckCircleIcon, ClockIcon } from './Icons'

export default function AlertsList({ alerts }) {
  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-500/10 border-l-4 border-red-500',
          icon: ShieldExclamationIcon,
          iconColor: 'text-red-500',
          badge: 'bg-red-500/20 text-red-300 border border-red-500/30'
        }
      case 'WARNING':
        return {
          bg: 'bg-yellow-500/10 border-l-4 border-yellow-500',
          icon: ExclamationTriangleIcon,
          iconColor: 'text-yellow-500',
          badge: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
        }
      default:
        return {
          bg: 'bg-blue-500/10 border-l-4 border-blue-500',
          icon: CheckCircleIcon,
          iconColor: 'text-blue-500',
          badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
        }
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000 / 60)
    
    if (diff < 1) return 'À l\'instant'
    if (diff < 60) return `Il y a ${diff} min`
    if (diff < 1440) return `Il y a ${Math.floor(diff / 60)} h`
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <ShieldExclamationIcon className="w-6 h-6" />
          <span>Alertes & Prédictions</span>
        </h2>
        <p className="text-sm text-gray-300 mt-1">{alerts.length} alertes récentes</p>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="py-12 text-center">
            <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-300">Aucune alerte récente</p>
          </div>
        ) : (
          alerts.map((alert, index) => {
            const config = getSeverityConfig(alert.severity)
            const Icon = config.icon
            
            return (
              <div 
                key={index} 
                className={`${config.bg} rounded-xl p-4 hover:bg-white/5 transition-all duration-200`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`${config.iconColor} mt-0.5`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-3 py-1 text-xs font-bold rounded-lg ${config.badge}`}>
                        {alert.type}
                      </span>
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <ClockIcon className="w-3.5 h-3.5" />
                        <span>{formatTime(alert.timestamp)}</span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-white mb-1">
                      {alert.machine?.hostname || 'Machine inconnue'}
                    </p>
                    <p className="text-sm text-gray-300">
                      {alert.message}
                    </p>
                    {alert.machine?.ip_address && (
                      <p className="mt-2 text-xs text-gray-400 font-mono">
                        {alert.machine.ip_address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
