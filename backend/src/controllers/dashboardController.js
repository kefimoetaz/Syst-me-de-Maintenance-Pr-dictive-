const { Machine, SystemMetrics, SmartData, Agent } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';
const ML_SERVICE_TOKEN = process.env.ML_SERVICE_TOKEN || 'dev-token-12345';

/**
 * Dashboard Controller
 * Provides endpoints for dashboard data visualization
 */

/**
 * Helper function to fetch prediction from database
 */
async function fetchPredictionFromDB(machineId) {
  try {
    const { sequelize } = require('../config/database');
    const [results] = await sequelize.query(`
      SELECT 
        risk_level,
        failure_probability_7d,
        failure_probability_14d,
        failure_probability_30d,
        prediction_date,
        model_version
      FROM predictions
      WHERE machine_id = :machineId
      ORDER BY prediction_date DESC
      LIMIT 1
    `, {
      replacements: { machineId },
      type: sequelize.QueryTypes.SELECT
    });
    
    return results || null;
  } catch (error) {
    return null;
  }
}

/**
 * GET /api/dashboard/overview
 * Returns overview statistics for dashboard KPIs
 * Requirements: 8.1
 */
exports.getOverview = async (req, res, next) => {
  try {
    // Total machines
    const totalMachines = await Machine.count();
    
    // Machines with recent data (last 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const activeMachines = await SystemMetrics.count({
      where: {
        created_at: {
          [Op.gte]: twoHoursAgo
        }
      },
      distinct: true,
      col: 'machine_id'
    });
    
    // Critical alerts (CPU > 90% or Memory > 90% or Disk > 90%)
    const criticalAlerts = await SystemMetrics.count({
      where: {
        created_at: {
          [Op.gte]: twoHoursAgo
        },
        [Op.or]: [
          { cpu_usage: { [Op.gte]: 90 } },
          { memory_usage: { [Op.gte]: 90 } },
          { disk_usage: { [Op.gte]: 90 } }
        ]
      }
    });
    
    // SMART warnings
    const smartWarnings = await SmartData.count({
      where: {
        created_at: {
          [Op.gte]: twoHoursAgo
        },
        health_status: {
          [Op.in]: ['WARNING', 'CRITICAL']
        }
      }
    });
    
    // Get high-risk machines from ML service
    let highRiskMachines = 0;
    try {
      const response = await axios.get(
        `${ML_SERVICE_URL}/api/predictions/high-risk`,
        {
          headers: { 'Authorization': `Bearer ${ML_SERVICE_TOKEN}` },
          timeout: 3000
        }
      );
      highRiskMachines = response.data.count || 0;
    } catch (error) {
      // ML service unavailable, continue without prediction data
    }
    
    res.json({
      totalMachines,
      activeMachines,
      inactiveMachines: totalMachines - activeMachines,
      criticalAlerts,
      smartWarnings,
      highRiskMachines,
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/machines
 * Returns list of all machines with their latest metrics and predictions
 * Requirements: 8.1, 8.2
 */
exports.getMachines = async (req, res, next) => {
  try {
    const machines = await Machine.findAll({
      include: [
        {
          model: SystemMetrics,
          as: 'systemMetrics',
          limit: 1,
          order: [['created_at', 'DESC']],
          required: false
        },
        {
          model: SmartData,
          as: 'smartData',
          limit: 1,
          order: [['created_at', 'DESC']],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Format response with predictions
    const formattedMachines = await Promise.all(machines.map(async (machine) => {
      const latestMetrics = machine.systemMetrics?.[0];
      const latestSmart = machine.smartData?.[0];
      
      // Fetch prediction from database
      const prediction = await fetchPredictionFromDB(machine.id);
      
      return {
        id: machine.id,
        hostname: machine.hostname,
        ip_address: machine.ip_address,
        serial_number: machine.serial_number,
        os: machine.os,
        status: latestMetrics ? 'online' : 'offline',
        cpu_usage: latestMetrics?.cpu_usage || 0,
        memory_usage: latestMetrics?.memory_usage || 0,
        disk_usage: latestMetrics?.disk_usage || 0,
        health_status: latestSmart?.health_status || 'UNKNOWN',
        last_seen: latestMetrics?.created_at || machine.created_at,
        // Prediction data
        prediction: prediction ? {
          risk_level: prediction.risk_level,
          failure_probability_7d: prediction.failure_probability_7d,
          failure_probability_14d: prediction.failure_probability_14d,
          failure_probability_30d: prediction.failure_probability_30d,
          prediction_date: prediction.prediction_date
        } : null
      };
    }));
    
    res.json(formattedMachines);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/machines/:id/metrics
 * Returns historical metrics and prediction details for a specific machine
 * Requirements: 8.2, 8.3
 */
exports.getMachineMetrics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { hours = 24 } = req.query;
    
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const metrics = await SystemMetrics.findAll({
      where: {
        machine_id: id,
        created_at: {
          [Op.gte]: startTime
        }
      },
      order: [['created_at', 'ASC']],
      limit: 100
    });
    
    const smartData = await SmartData.findAll({
      where: {
        machine_id: id,
        created_at: {
          [Op.gte]: startTime
        }
      },
      order: [['created_at', 'ASC']],
      limit: 100
    });
    
    // Fetch full prediction details from database
    const prediction = await fetchPredictionFromDB(id);
    
    // Fetch anomalies for this machine
    let anomalies = [];
    try {
      const anomalyResponse = await axios.get(
        `${ML_SERVICE_URL}/api/anomalies?machine_id=${id}&days=7`,
        {
          headers: { 'Authorization': `Bearer ${ML_SERVICE_TOKEN}` },
          timeout: 3000
        }
      );
      anomalies = anomalyResponse.data.anomalies || [];
    } catch (error) {
      // Continue without anomaly data
    }
    
    res.json({
      metrics,
      smartData,
      prediction,
      anomalies
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/alerts
 * Returns recent alerts and warnings
 */
exports.getAlerts = async (req, res, next) => {
  try {
    const { hours = 24 } = req.query;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    // Get prediction alerts from alerts table
    const { Alert } = require('../models');
    const predictionAlerts = await Alert.findAll({
      where: {
        created_at: {
          [Op.gte]: startTime
        },
        status: {
          [Op.in]: ['ACTIVE', 'ACKNOWLEDGED']
        }
      },
      include: [
        {
          model: Machine,
          as: 'machine',
          attributes: ['id', 'hostname', 'ip_address']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 20
    });
    
    // Find high resource usage
    const resourceAlerts = await SystemMetrics.findAll({
      where: {
        created_at: {
          [Op.gte]: startTime
        },
        [Op.or]: [
          { cpu_usage: { [Op.gte]: 80 } },
          { memory_usage: { [Op.gte]: 80 } },
          { disk_usage: { [Op.gte]: 80 } }
        ]
      },
      include: [
        {
          model: Machine,
          as: 'machine',
          attributes: ['id', 'hostname', 'ip_address']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 30
    });
    
    // Find SMART warnings
    const smartAlerts = await SmartData.findAll({
      where: {
        created_at: {
          [Op.gte]: startTime
        },
        health_status: {
          [Op.in]: ['WARNING', 'CRITICAL']
        }
      },
      include: [
        {
          model: Machine,
          as: 'machine',
          attributes: ['id', 'hostname', 'ip_address']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 30
    });
    
    // Format alerts
    const alerts = [];
    
    // Add prediction alerts (highest priority)
    predictionAlerts.forEach(alert => {
      alerts.push({
        id: alert.id,
        type: alert.alert_type,
        severity: alert.severity,
        machine: alert.machine,
        value: alert.details?.failure_probability_30d || 0,
        message: alert.title,
        details: alert.details,
        status: alert.status,
        timestamp: alert.created_at
      });
    });
    
    resourceAlerts.forEach(metric => {
      if (metric.cpu_usage >= 80) {
        alerts.push({
          type: 'CPU',
          severity: metric.cpu_usage >= 90 ? 'CRITICAL' : 'WARNING',
          machine: metric.machine,
          value: metric.cpu_usage,
          message: `CPU usage at ${metric.cpu_usage}%`,
          timestamp: metric.created_at
        });
      }
      if (metric.memory_usage >= 80) {
        alerts.push({
          type: 'MEMORY',
          severity: metric.memory_usage >= 90 ? 'CRITICAL' : 'WARNING',
          machine: metric.machine,
          value: metric.memory_usage,
          message: `Memory usage at ${metric.memory_usage}%`,
          timestamp: metric.created_at
        });
      }
      if (metric.disk_usage >= 80) {
        alerts.push({
          type: 'DISK',
          severity: metric.disk_usage >= 90 ? 'CRITICAL' : 'WARNING',
          machine: metric.machine,
          value: metric.disk_usage,
          message: `Disk usage at ${metric.disk_usage}%`,
          timestamp: metric.created_at
        });
      }
    });
    
    smartAlerts.forEach(smart => {
      alerts.push({
        type: 'SMART',
        severity: smart.health_status,
        machine: smart.machine,
        value: smart.health_status,
        message: `Disk health: ${smart.health_status}`,
        timestamp: smart.created_at
      });
    });
    
    // Sort by timestamp descending
    alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json(alerts.slice(0, 50));
  } catch (error) {
    next(error);
  }
};
