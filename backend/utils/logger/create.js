const winston = require("winston");
const initFileLogger = require("./file");
const logToSqlServer = require("./sql");

// Custom Winston transport for SQL logging
class SqlTransport extends winston.Transport {
  async log(info, callback) {
    try {
      await logToSqlServer(info.level, info.message);
      callback();
    } catch (err) {
      callback(err);
    }
  }
}

// Create a combined logger
const createLogger = (logFolder, enableSqlLogging = false) => {
  const fileLogger = initFileLogger(logFolder);

  if (enableSqlLogging) {
    fileLogger.add(new SqlTransport());
  }

  return fileLogger;
};

module.exports = createLogger;
