const { sequelize, Machine, SystemMetrics, SmartData } = require('../models');
const { logger } = require('../middleware/error');

/**
 * Data Controller
 * Requirements: 7.6, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 11.4, 11.5
 * 
 * Handles receiving and storing data from agents
 */
class DataController {
    /**
     * Receive and store data from an agent
     * All operations are wrapped in a transaction for atomicity
     */
    async receiveData(req, res, next) {
        const transaction = await sequelize.transaction();
        
        try {
            const { machine, timestamp, system_metrics, smart_data } = req.body;
            const agent = req.agent; // Attached by auth middleware
            
            // 1. Find or create Machine by serial_number
            const [machineRecord, created] = await Machine.findOrCreate({
                where: { serial_number: machine.serial_number },
                defaults: {
                    hostname: machine.hostname,
                    ip_address: machine.ip_address,
                    os: machine.os
                },
                transaction
            });
            
            // Update machine info if it already existed
            if (!created) {
                await machineRecord.update({
                    hostname: machine.hostname,
                    ip_address: machine.ip_address,
                    os: machine.os
                }, { transaction });
            }
            
            const machineId = machineRecord.id;
            
            // 2. Insert SystemMetrics record
            const systemMetricsRecord = await SystemMetrics.create({
                machine_id: machineId,
                timestamp: new Date(timestamp),
                cpu_usage: system_metrics.cpu_usage,
                cpu_temperature: system_metrics.cpu_temperature,
                memory_usage: system_metrics.memory_usage,
                memory_available: system_metrics.memory_available,
                memory_total: system_metrics.memory_total,
                disk_usage: system_metrics.disk_usage,
                disk_free: system_metrics.disk_free,
                disk_total: system_metrics.disk_total
            }, { transaction });
            
            // 3. Insert SmartData record
            const smartDataRecord = await SmartData.create({
                machine_id: machineId,
                timestamp: new Date(timestamp),
                health_status: smart_data.health_status,
                read_errors: smart_data.read_errors,
                write_errors: smart_data.write_errors,
                temperature: smart_data.temperature
            }, { transaction });
            
            // 4. Commit transaction
            await transaction.commit();
            
            // 5. Log success
            logger.info({
                type: 'data_received',
                machine_id: machineId,
                serial_number: machine.serial_number,
                agent_id: agent.agent_id,
                system_metrics_id: systemMetricsRecord.id,
                smart_data_id: smartDataRecord.id,
                timestamp: new Date().toISOString()
            });
            
            // 6. Return 201 with record IDs
            return res.status(201).json({
                message: 'Data received successfully',
                id: systemMetricsRecord.id,
                machine_id: machineId,
                system_metrics_id: systemMetricsRecord.id,
                smart_data_id: smartDataRecord.id
            });
            
        } catch (error) {
            // Rollback transaction on any error
            await transaction.rollback();
            
            // Log the error with SQL details if available
            logger.error({
                type: 'data_receive_error',
                message: error.message,
                stack: error.stack,
                sql: error.sql,
                timestamp: new Date().toISOString()
            });
            
            // Pass error to error handling middleware
            next(error);
        }
    }
}

module.exports = new DataController();
