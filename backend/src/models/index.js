const { sequelize } = require('../config/database');
const Machine = require('./Machine');
const Agent = require('./Agent');
const SystemMetrics = require('./SystemMetrics');
const SmartData = require('./SmartData');
const Alert = require('./Alert');

/**
 * Define model associations
 * Requirements: 10.5
 */

// Machine has many SystemMetrics
Machine.hasMany(SystemMetrics, {
    foreignKey: 'machine_id',
    onDelete: 'CASCADE',
    as: 'systemMetrics'
});
SystemMetrics.belongsTo(Machine, {
    foreignKey: 'machine_id',
    as: 'machine'
});

// Machine has many SmartData
Machine.hasMany(SmartData, {
    foreignKey: 'machine_id',
    onDelete: 'CASCADE',
    as: 'smartData'
});
SmartData.belongsTo(Machine, {
    foreignKey: 'machine_id',
    as: 'machine'
});

// Machine has one Agent
Machine.hasOne(Agent, {
    foreignKey: 'machine_id',
    onDelete: 'CASCADE',
    as: 'agent'
});
Agent.belongsTo(Machine, {
    foreignKey: 'machine_id',
    as: 'machine'
});

// Machine has many Alerts
Machine.hasMany(Alert, {
    foreignKey: 'machine_id',
    onDelete: 'CASCADE',
    as: 'alerts'
});
Alert.belongsTo(Machine, {
    foreignKey: 'machine_id',
    as: 'machine'
});

module.exports = {
    sequelize,
    Machine,
    Agent,
    SystemMetrics,
    SmartData,
    Alert
};
