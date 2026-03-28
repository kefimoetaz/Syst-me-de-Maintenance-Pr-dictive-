const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Alert Model
 * Represents system alerts and notifications
 */
const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  machine_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'machines',
      key: 'id'
    }
  },
  alert_type: {
    type: DataTypes.ENUM('PREDICTION', 'METRIC', 'SMART', 'ANOMALY'),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'),
    defaultValue: 'ACTIVE'
  },
  acknowledged_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  acknowledged_by: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  email_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  email_sent_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notification_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'alerts',
  timestamps: false,
  underscored: true
});

module.exports = Alert;
