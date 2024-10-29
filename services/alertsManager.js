// Add services/AlertsManager.js
class AlertsManager {
    constructor() {
        this.Alert = require('../models/Alert');
    }

    async addAlert(userId, tokenAddress, priceTarget, condition) {
        const alert = new this.Alert({
            userId,
            tokenAddress,
            priceTarget,
            condition
        });
        await alert.save();
    }

    async checkAlerts() {
        const activeAlerts = await this.Alert.find({ active: true });
        for (const alert of activeAlerts) {
            const currentPrice = await this.getCurrentPrice(alert.tokenAddress);
            if (this.shouldTrigger(alert, currentPrice)) {
                await this.triggerAlert(alert);
            }
        }
    }

    async shouldTrigger(alert, currentPrice) {
        return alert.condition === 'above' ? 
            currentPrice >= alert.priceTarget : 
            currentPrice <= alert.priceTarget;
    }
}