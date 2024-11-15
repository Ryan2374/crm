const oracledb = require('oracledb');
const { oracleDbConfig } = require('./config');
const NetSuiteIntegration = require('./netsuiteIntegration');
const Logger = require('./logger');

class CRMSystem {
  constructor() {
    this.customers = [];
    this.users = {};  // Dictionary for storing users with roles
    this.netSuite = new NetSuiteIntegration();
  }

  async initialize() {
    try {
      await this.netSuite.authenticate();
      this.connection = await oracledb.getConnection(oracleDbConfig);
      Logger.info("Connected to Oracle Database successfully.");
    } catch (error) {
      Logger.error("Failed to connect to Oracle Database: ", error);
    }
  }

  async addUser(username, role) {
    if (!['admin', 'manager', 'user'].includes(role)) {
      Logger.warn(`Attempt to add user with invalid role: ${role}`);
      throw new Error("Invalid role");
    }
    this.users[username] = { role };
    Logger.info(`User ${username} added with role: ${role}`);
  }

  async checkPermissions(username, requiredRole) {
    const user = this.users[username];
    if (!user || (requiredRole !== 'user' && user.role !== requiredRole && user.role !== 'admin')) {
      Logger.warn(`Permission denied for user: ${username}`);
      throw new Error("Permission denied");
    }
  }

  async addCustomer(username, customerId, name, email, phone) {
    await this.checkPermissions(username, 'manager');
    try {
      const result = await this.connection.execute(
        `INSERT INTO customers (customer_id, name, email, phone) 
         VALUES (:customerId, :name, :email, :phone)`,
        { customerId, name, email, phone },
        { autoCommit: true }
      );
      Logger.info(`Customer ${name} added by ${username}`);
    } catch (error) {
      Logger.error("Failed to add customer: ", error);
    }
  }

  async getCustomer(username, customerId) {
    await this.checkPermissions(username, 'user');
    try {
      const result = await this.connection.execute(
        `SELECT * FROM customers WHERE customer_id = :customerId`,
        { customerId }
      );
      Logger.info(`Customer ${customerId} retrieved by ${username}`);
      return result.rows[0];
    } catch (error) {
      Logger.error("Failed to retrieve customer: ", error);
    }
  }

  async listCustomers(username) {
    await this.checkPermissions(username, 'user');
    try {
      const result = await this.connection.execute(`SELECT * FROM customers`);
      Logger.info(`Customer list retrieved by ${username}`);
      return result.rows;
    } catch (error) {
      Logger.error("Failed to list customers: ", error);
    }
  }

  async addInteraction(username, customerId, interaction) {
    await this.checkPermissions(username, 'user');
    try {
      const result = await this.connection.execute(
        `INSERT INTO interactions (customer_id, interaction)
         VALUES (:customerId, :interaction)`,
        { customerId, interaction },
        { autoCommit: true }
      );
      Logger.info(`Interaction added for customer ${customerId} by ${username}`);
    } catch (error) {
      Logger.error("Failed to add interaction: ", error);
    }
  }

  async fetchAndUpdateBillingInfo(username, customerId) {
    await this.checkPermissions(username, 'manager');
    try {
      const billingInfo = await this.netSuite.getBillingInfo(customerId);
      Logger.info(`Billing info for customer ${customerId} fetched by ${username}`);
      // Logic to update billing info in Oracle DB goes here
    } catch (error) {
      Logger.error("Failed to fetch billing info: ", error);
    }
  }
}

module.exports = CRMSystem;
