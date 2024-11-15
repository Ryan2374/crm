const CRMSystem = require('./crmSystem');
const ReportGenerator = require('./reports');
const Logger = require('./logger');

(async () => {
  const crm = new CRMSystem();
  await crm.initialize();

  // Add roles to users
  await crm.addUser('admin_user', 'admin');
  await crm.addUser('manager_user', 'manager');
  await crm.addUser('regular_user', 'user');

  // Admin adds a customer
  await crm.addCustomer('admin_user', 123, "Alice Johnson", "alice@example.com", "555-1234");
  await crm.addCustomer('manager_user', 456, "Bob Smith", "bob@example.com", "555-5678");

  // Regular user adds an interaction
  await crm.addInteraction('regular_user', 123, "Discussed product upgrade");

  // Manager fetches billing info
  await crm.fetchAndUpdateBillingInfo('manager_user', 123);

  // Generate reports (Admin only)
  const reports = new ReportGenerator();
  await reports.initialize();
  await reports.generateCustomerActivityReport();
  await reports.generateBillingReport();
})();
