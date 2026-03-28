/**
 * Email Notification Service
 * Sends email alerts for predictive maintenance notifications
 */
const nodemailer = require('nodemailer');
const { logger } = require('../middleware/error');

class EmailService {
    constructor() {
        this.transporter = null;
        this.enabled = false;
        this.initialize();
    }

    initialize() {
        // Check if email configuration is provided
        const emailConfig = {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        };

        // Only enable if SMTP configuration is provided
        if (emailConfig.host && emailConfig.auth.user && emailConfig.auth.pass) {
            try {
                this.transporter = nodemailer.createTransport(emailConfig);
                this.enabled = true;
                logger.info('Email service initialized successfully');
            } catch (error) {
                logger.error(`Failed to initialize email service: ${error.message}`);
                this.enabled = false;
            }
        } else {
            logger.warn('Email service disabled - SMTP configuration not provided');
            this.enabled = false;
        }
    }

    /**
     * Send alert email notification
     * 
     * @param {Object} alert - Alert object
     * @param {Object} machine - Machine object
     * @returns {Promise<boolean>} - Success status
     */
    async sendAlertEmail(alert, machine) {
        if (!this.enabled) {
            logger.debug('Email service disabled - skipping email notification');
            return false;
        }

        try {
            const recipients = process.env.ALERT_EMAIL_RECIPIENTS || process.env.SMTP_USER;
            
            if (!recipients) {
                logger.warn('No email recipients configured');
                return false;
            }

            const subject = this.generateSubject(alert, machine);
            const html = this.generateEmailHTML(alert, machine);
            const text = this.generateEmailText(alert, machine);

            const mailOptions = {
                from: `"Predictive Maintenance System" <${process.env.SMTP_USER}>`,
                to: recipients,
                subject: subject,
                text: text,
                html: html
            };

            await this.transporter.sendMail(mailOptions);
            logger.info(`Alert email sent successfully for machine ${machine.hostname}`);
            return true;

        } catch (error) {
            logger.error(`Failed to send alert email: ${error.message}`);
            return false;
        }
    }

    generateSubject(alert, machine) {
        const severityEmoji = {
            'CRITICAL': '🔴',
            'HIGH': '🟠',
            'MEDIUM': '🟡',
            'LOW': '🟢'
        };

        return `${severityEmoji[alert.severity]} ${alert.severity} Alert: ${machine.hostname} - ${alert.title}`;
    }

    generateEmailText(alert, machine) {
        return `
PREDICTIVE MAINTENANCE ALERT

Severity: ${alert.severity}
Machine: ${machine.hostname} (${machine.ip_address})
Alert Type: ${alert.alert_type}

${alert.title}

${alert.message}

${alert.details ? `\nDetails:\n${JSON.stringify(alert.details, null, 2)}` : ''}

Time: ${new Date(alert.created_at).toLocaleString()}

---
This is an automated alert from the Predictive Maintenance System.
Please review the dashboard for more information: ${process.env.DASHBOARD_URL || 'http://localhost:5173'}
        `.trim();
    }

    generateEmailHTML(alert, machine) {
        const severityColors = {
            'CRITICAL': '#dc2626',
            'HIGH': '#ea580c',
            'MEDIUM': '#ca8a04',
            'LOW': '#16a34a'
        };

        const color = severityColors[alert.severity] || '#6b7280';

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .alert-badge {
            display: inline-block;
            background: ${color};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 10px;
        }
        .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .info-row {
            margin: 15px 0;
            padding: 10px;
            background: white;
            border-radius: 5px;
            border-left: 4px solid ${color};
        }
        .info-label {
            font-weight: bold;
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
        }
        .info-value {
            color: #111827;
            font-size: 16px;
            margin-top: 5px;
        }
        .message-box {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border: 1px solid #e5e7eb;
        }
        .details-box {
            background: #1f2937;
            color: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            overflow-x: auto;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            background: ${color};
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>⚠️ Predictive Maintenance Alert</h1>
        <div class="alert-badge">${alert.severity} SEVERITY</div>
    </div>
    
    <div class="content">
        <div class="info-row">
            <div class="info-label">Machine</div>
            <div class="info-value">${machine.hostname}</div>
        </div>
        
        <div class="info-row">
            <div class="info-label">IP Address</div>
            <div class="info-value">${machine.ip_address}</div>
        </div>
        
        <div class="info-row">
            <div class="info-label">Alert Type</div>
            <div class="info-value">${alert.alert_type}</div>
        </div>
        
        <div class="info-row">
            <div class="info-label">Time</div>
            <div class="info-value">${new Date(alert.created_at).toLocaleString()}</div>
        </div>
        
        <div class="message-box">
            <h2 style="margin-top: 0; color: ${color};">${alert.title}</h2>
            <p>${alert.message}</p>
        </div>
        
        ${alert.details ? `
        <div class="details-box">
            <strong>Technical Details:</strong><br>
            <pre>${JSON.stringify(alert.details, null, 2)}</pre>
        </div>
        ` : ''}
        
        <center>
            <a href="${process.env.DASHBOARD_URL || 'http://localhost:5173'}" class="button">
                View Dashboard →
            </a>
        </center>
    </div>
    
    <div class="footer">
        <p>This is an automated alert from the Predictive Maintenance System.</p>
        <p>Please do not reply to this email.</p>
    </div>
</body>
</html>
        `.trim();
    }

    /**
     * Test email configuration
     * 
     * @returns {Promise<boolean>} - Success status
     */
    async testConnection() {
        if (!this.enabled) {
            return false;
        }

        try {
            await this.transporter.verify();
            logger.info('Email service connection test successful');
            return true;
        } catch (error) {
            logger.error(`Email service connection test failed: ${error.message}`);
            return false;
        }
    }
}

// Export singleton instance
module.exports = new EmailService();
