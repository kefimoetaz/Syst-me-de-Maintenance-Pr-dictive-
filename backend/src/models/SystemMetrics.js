const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * SystemMetrics model
 * Requirements: 10.3
 * Stores system performance metrics collected by agents
 */
const SystemMetrics = sequelize.define('SystemMetrics', {
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
    cpu_usage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'CPU usage must be at least 0'
            },
            max: {
                args: [100],
                msg: 'CPU usage cannot exceed 100'
            }
        }
    },
    cpu_temperature: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
            min: {
                args: [-50],
                msg: 'CPU temperature must be at least -50°C'
            },
            max: {
                args: [150],
                msg: 'CPU temperature cannot exceed 150°C'
            }
        }
    },
    memory_usage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'Memory usage must be at least 0'
            },
            max: {
                args: [100],
                msg: 'Memory usage cannot exceed 100'
            }
        }
    },
    memory_available: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'Memory available must be positive'
            }
        }
    },
    memory_total: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'Memory total must be positive'
            }
        }
    },
    disk_usage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'Disk usage must be at least 0'
            },
            max: {
                args: [100],
                msg: 'Disk usage cannot exceed 100'
            }
        }
    },
    disk_free: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'Disk free must be positive'
            }
        }
    },
    disk_total: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'Disk total must be positive'
            }
        }
    }
}, {
    tableName: 'system_metrics',
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
        }
    ]
});

module.exports = SystemMetrics;
