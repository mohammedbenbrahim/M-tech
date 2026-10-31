const sql = require("mssql");
const { config } = require("../../config");

async function logToSqlServer(level, message) {
  let pool;
  try {
    if (!config?.connectionString) {
      console.error("SQL config not found or incorrect.");
      
      return;
    }

    pool = await new sql.ConnectionPool(config?.connectionString).connect();

    const query = `
      INSERT INTO [logs] ([level], [message], [method], [endpoint], [ipAddress], [user], [timestamp]) 
      VALUES (@level, @message, @method, @endpoint, @ipAddress, @user, GETDATE())
    `;

    const formattedMessage = typeof message === "object" ? JSON.stringify(message) : message;

    await pool.request()
      .input("level", sql.NVarChar(10), level)
      .input("message", sql.NVarChar, formattedMessage)
      .input("method", sql.NVarChar, message?.method || null)
      .input("endpoint", sql.NVarChar, message?.endpoint || null)
      .input("ipAddress", sql.NVarChar, message?.ipAddress || null)
      .input("user", sql.Int, message?.user || null)
      .query(query);
  } catch (error) {
    console.error(`Error logging to SQL Server: ${error.message}`);
  } finally {
    pool?.close();
  }
}

module.exports = logToSqlServer;