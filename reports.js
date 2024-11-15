const { Parser } = require('json2csv');
const oracledb = require('oracledb');
const { oracleDbConfig } = require('./config');
const fs = require('fs');
const Logger = require('./logger');

class ReportGenerator {
  constructor() {
    this.connection = null;
  }

  async initialize() {
    try {
      this.connection = await oracledb.getConnection(oracleDbConfig);
      Logger.info("Connected to Oracle Database for report generation.");
    } catch (error) {
      Logger.error("Failed to connect to Oracle Database: ", error);
    }
  }

  async generateCustomerActivityReport() {
    try {
      const result = await this.connection.execute(`SELECT * FROM interactions`);
      const fields = ['CUSTOMER_ID', 'INTERACTION', 'DATE'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(result.rows);

      fs.writeFileSync('customer-activity-report.csv', csv);
      Logger.info("Customer activity report generated.");
    } catch (error) {
      Logger.error("Failed to generate customer activity report: ", error);
    }
  }

  async generateBillingReport() {
    try {
      const result = await this.connection.execute(`
        SELECT customers.customer_id, customers.name, payments.amount
        FROM customers
        JOIN payments ON customers.customer_id = payments.customer_id
      `);
      const fields = ['CUSTOMER_ID', 'NAME', 'AMOUNT'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(result.rows);

      fs.writeFileSync('billing-report.csv', csv);
      Logger.info("Billing report generated.");
    } catch (error) {
      Logger.error("Failed to generate billing report: ", error);
    }
  }
}

module.exports = ReportGenerator;
