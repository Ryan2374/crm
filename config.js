require('dotenv').config();

module.exports = {
  oracleDbConfig: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION_STRING,
  },
  netSuiteConfig: {
    clientId: process.env.NETSUITE_CLIENT_ID,
    clientSecret: process.env.NETSUITE_CLIENT_SECRET,
    accountId: process.env.NETSUITE_ACCOUNT_ID,
    tokenUrl: `https://${process.env.NETSUITE_ACCOUNT_ID}.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token`,
    baseApiUrl: `https://${process.env.NETSUITE_ACCOUNT_ID}.suitetalk.api.netsuite.com/services/rest/record/v1/`,
  },
};
