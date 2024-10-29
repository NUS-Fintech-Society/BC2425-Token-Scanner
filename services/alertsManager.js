// services/alertsManager.js
const mongoose = require('mongoose');
const Alert = require('../models/Alert');
const config = require('../config');

class AlertsManager {
    constructor() {
        this.Alert = Alert;
        this.checkInterval = config.ALERT_CHECK_INTERVAL || 30000;
        this.lastCheck = Date.now();
        this.activeAlerts = new Map();
    }

    async initialize() {
        try {
            await this.loadActiveAlerts();
            console.log('Alerts Manager initialized successfully');
        } catch (error) {
            console.error('Error initializing Alerts Manager:', error);
            throw error;
        }
    }

    async loadActiveAlerts() {
        const alerts = await this.Alert.find({ active: true });
        alerts.forEach(alert => {
            this.activeAlerts.set(alert._id.toString(), alert);
        });
        console.log(`Loaded ${this.activeAlerts.size} active alerts`);
    }

    async addAlert(userId, tokenAddress, priceTarget, condition) {
        try {
            const alert = new this.Alert({
                userId,
                tokenAddress,
                priceTarget,
                condition,
                active: true,
                createdAt: Date.now()
            });

            await alert.save();
            this.activeAlerts.set(alert._id.toString(), alert);
            
            return {
                success: true,
                alert: alert
            };
        } catch (error) {
            console.error('Error adding alert:', error);
            throw error;
        }
    }

    async removeAlert(userId, alertId) {
        try {
            const alert = await this.Alert.findOne({
                _id: alertId,
                userId: userId
            });

            if (!alert) {
                throw new Error('Alert not found');
            }

            alert.active = false;
            await alert.save();
            this.activeAlerts.delete(alertId);

            return {
                success: true,
                message: 'Alert removed successfully'
            };
        } catch (error) {
            console.error('Error removing alert:', error);
            throw error;
        }
    }

    async getUserAlerts(userId) {
        try {
            return await this.Alert.find({
                userId: userId,
                active: true
            }).sort({ createdAt: -1 });
        } catch (error) {
            console.error('Error getting user alerts:', error);
            throw error;
        }
    }

    async checkAlerts() {
        try {
            const currentTime = Date.now();
            console.log(`Checking alerts at ${new Date(currentTime).toISOString()}`);

            const alertPromises = Array.from(this.activeAlerts.values()).map(
                alert => this.checkAlert(alert)
            );

            await Promise.all(alertPromises);
            this.lastCheck = currentTime;
        } catch (error) {
            console.error('Error checking alerts:', error);
        }
    }

    async checkAlert(alert) {
        try {
            const currentPrice = await this.getCurrentPrice(alert.tokenAddress);
            if (this.shouldTrigger(alert, currentPrice)) {
                await this.triggerAlert(alert, currentPrice);
            }
        } catch (error) {
            console.error(`Error checking alert ${alert._id}:`, error);
        }
    }

    async getCurrentPrice(tokenAddress) {
        try {
            // Implement price fetching logic here
            // This should integrate with your price feed service
            return 0; // Placeholder
        } catch (error) {
            console.error('Error getting current price:', error);
            throw error;
        }
    }

    shouldTrigger(alert, currentPrice) {
        switch (alert.condition) {
            case 'above':
                return currentPrice >= alert.priceTarget;
            case 'below':
                return currentPrice <= alert.priceTarget;
            case 'equals':
                return Math.abs(currentPrice - alert.priceTarget) < 0.0001;
            default:
                return false;
        }
    }

    async triggerAlert(alert, currentPrice) {
        try {
            // Update alert status
            alert.triggeredAt = Date.now();
            alert.triggerPrice = currentPrice;
            alert.active = false;
            
            await alert.save();
            this.activeAlerts.delete(alert._id.toString());

            // Notify user
            await this.sendAlertNotification(alert);

            return {
                success: true,
                alert: alert
            };
        } catch (error) {
            console.error('Error triggering alert:', error);
            throw error;
        }
    }

    async sendAlertNotification(alert) {
        try {
            // Implement notification logic here
            console.log(`Alert triggered for token ${alert.tokenAddress}`);
        } catch (error) {
            console.error('Error sending alert notification:', error);
        }
    }

    async clearExpiredAlerts() {
        try {
            const expiryTime = Date.now() - (config.ALERT_EXPIRY_TIME || 7 * 24 * 60 * 60 * 1000);
            await this.Alert.updateMany(
                {
                    active: true,
                    createdAt: { $lt: expiryTime }
                },
                {
                    $set: { active: false }
                }
            );

            await this.loadActiveAlerts();
        } catch (error) {
            console.error('Error clearing expired alerts:', error);
        }
    }
}

module.exports = AlertsManager;