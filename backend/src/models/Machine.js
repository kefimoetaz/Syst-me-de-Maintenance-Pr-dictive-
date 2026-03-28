const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Machine model
 * Requirements: 10.1
 * Represents physical machines in the IT infrastructure
 */
const Machine = sequelize.define('Machine', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    hostname: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Hostname cannot be empty'
            }
        }
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: false,
        validate: {
            isIP: {
                msg: 'Must be a valid IP address'
            }
        }
    },
    serial_number: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Serial number cannot be empty'
            }
        }
    },
    os: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'OS cannot be empty'
            }
        }
    }
}, {
    tableName: 'machines',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['serial_number']
        }
    ]
});

module.exports = Machine;
