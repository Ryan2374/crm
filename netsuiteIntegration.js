const axios = require('axios');
const { netSuiteConfig } = require('./config');
const Logger = require('./logger');

class NetSuiteIntegration {
  constructor() {
    this.token = null;
    this.rateLimit = 1000; // Assume 1000 requests per hour
    this.requestsMade = 0;
    this.requestStartTime = Date.now();
  }

  async authenticate() {
    try {
      const response = await axios.post(netSuiteConfig.tokenUrl, {
        client_id: netSuiteConfig.clientId,
        client_secret: netSuiteConfig.clientSecret,
        grant_type: 'client_credentials',
      });
      this.token = response.data.access_token;
      Logger.info("Authenticated successfully with NetSuite.");
    } catch (error) {
      Logger.error("Failed to authenticate with NetSuite: ", error);
    }
  }

  checkRateLimit() {
    const elapsedTime = Date.now() - this.requestStartTime;
    if (elapsedTime >= 3600000) { // 1 hour in milliseconds
      this.requestsMade = 0;
      this.requestStartTime = Date.now();
    }
    if (this.requestsMade >= this.rateLimit) {
      throw new Error("Rate limit exceeded.");
    }
  }

  async makeApiRequest(url) {
    this.checkRateLimit();
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      this.requestsMade++;
      return response.data;
    } catch (error) {
      Logger.error("Error making API request to NetSuite: ", error);
    }
  }

  async getBillingInfo(customerId) {
    const url = `${netSuiteConfig.baseApiUrl}customer/${customerId}/transactions`;
    return await this.makeApiRequest(url);
  }

  async getInvoices(customerId) {
    const url = `${netSuiteConfig.baseApiUrl}invoice?customer=${customerId}`;
    return await this.makeApiRequest(url);
  }

  async getPayments(customerId) {
    const url = `${netSuiteConfig.baseApiUrl}customerpayment?customer=${customerId}`;
    return await this.makeApiRequest(url);
  }
}

module.exports = NetSuiteIntegration;
