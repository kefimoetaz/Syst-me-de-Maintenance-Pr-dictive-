import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { ChartBarIcon } from './Icons'

export default function SystemHealthChart({ machines }) {
  const calculateHealthStats = () => {
    let healthy = 0
    let warning = 0
    let critical = 0

    machines.forEach(machine => {
      const maxUsage = Math.max(
        parseFloat(machine.cpu_usage),
        parseFloat(machine.memory_usage),
        parseFloat(machine.disk_usage)
      )

      if (maxUsage >= 90 || machine.health_status === 'CRITICAL') {
        critical++
      } else if (maxUsage >= 80 || machine.health_status === 'WARNING') {
        warning++
      } else {
        healthy++
      }
    })

    return [
      { name: 'Sain', value: healthy, color: '#10b981' },
      { name: 'Avertissement', value: warning, color: '#f59e0b' },
      { name: 'Critique', value: critical, color: '#ef4444' }
    ]
  }

  const data = calculateHealthStats()

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
        <ChartBarIcon className="w-6 h-6" />
        <span>État Global du Système</span>
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-gray-300">{item.name}</span>
            </div>
            <span className="font-semibold text-white">{item.value} PCs</span>
          </div>
        ))}
      </div>
    </div>
  )
}
