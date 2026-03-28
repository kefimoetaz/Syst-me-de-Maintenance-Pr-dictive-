const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * SmartData model
 * Requirements: 10.4
 * Stores SMART disk health data collected by agents
 */
const SmartData = sequelize.define('SmartData', {
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
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: {
                msg: 'Timestamp must be a valid date'
            }
        }
    },
    health_status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: {
                args: [['GOOD', 'WARNING', 'CRITICAL']],
                msg: 'Health status must be GOOD, WARNING, or CRITICAL'
            }
        }
    },
    read_errors: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: 'Read errors must be non-negative'
            }
        }
    },
    write_errors: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: 'Write errors must be non-negative'
            }
        }
    },
    temperature: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
            min: {
                args: [-50],
                msg: 'Temperature must be at least -50°C'
            },
            max: {
                args: [150],
                msg: 'Temperature cannot exceed 150°C'
            }
        }
    }
}, {
    tableName: 'smart_data',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        {
            fields: ['machine_id']
        },
        {
            fields: ['timestamp']
        },
        {
            fields: ['machine_id', 'timestamp']
        },
        {
            fields: ['health_status']
        }
    ]
});

module.exports = SmartData;
