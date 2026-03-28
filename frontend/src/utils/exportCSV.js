/**
 * Generic CSV exporter — no dependencies, pure browser
 */
export function exportToCSV(filename, rows) {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const escape  = (v) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return s.includes(',') || s.includes('\n') || s.includes('"') ? `"${s}"` : s;
  };

  const csv = [
    headers.join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportMachines(machines) {
  const rows = machines.map(m => ({
    ID:            m.id,
    Hostname:      m.hostname,
    IP:            m.ip_address,
    OS:            m.os,
    Statut:        m.status,
    CPU_pct:       m.cpu_usage,
    RAM_pct:       m.memory_usage,
    Disque_pct:    m.disk_usage,
    Sante_disque:  m.health_status,
    Risque_ML:     m.prediction?.risk_level || '',
    Proba_30j_pct: m.prediction?.failure_probability_30d || '',
    Derniere_vue:  m.last_seen ? new Date(m.last_seen).toLocaleString('fr-FR') : '',
  }));
  exportToCSV(`machines_${timestamp()}.csv`, rows);
}

export function exportAlerts(alerts) {
  const rows = alerts.map(a => ({
    ID:          a.id,
    Machine:     a.machine?.hostname || a.machine_id,
    Type:        a.type || a.alert_type,
    Severite:    a.severity,
    Message:     a.message,
    Statut:      a.status,
    Date:        a.timestamp ? new Date(a.timestamp).toLocaleString('fr-FR') : '',
  }));
  exportToCSV(`alertes_${timestamp()}.csv`, rows);
}

function timestamp() {
  return new Date().toISOString().slice(0, 10);
}
