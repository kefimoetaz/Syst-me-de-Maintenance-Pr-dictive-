const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Agent model
 * Requirements: 10.2
 * Stores agent authentication tokens and links agents to machines
 */
const Agent = sequelize.define('Agent', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    agent_id: {
        type: DataTypes.UUID,
        unique: true,
        allowNull: false,
        validate: {
            isUUID: {
                args: 4,
                msg: 'Agent ID must be a valid UUID'
            }
        }
    },
    machine_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'machines',
            key: 'id'
        }
    },
    token: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Token cannot be empty'
            }
        }
    }
}, {
    tableName: 'agents',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        {
            unique: true,
            fields: ['agent_id']
        },
        {
            unique: true,
            fields: ['token']
        },
        {
            fields: ['machine_id']
        }
    ]
});

module.exports = Agent;
