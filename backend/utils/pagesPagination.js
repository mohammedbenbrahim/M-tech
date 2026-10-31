const { mainLogger } = require("./logger");
const logger = mainLogger; // Initialize the logger

/**
 * Fetches paginated data based on the provided query, page, and pageSize.
 * @param {number} page - The current page number (starting from 0).
 * @param {number} pageSize - The number of records per page.
 * @param {string} query - The SQL query to execute for fetching data.
 * @returns {Object|null} - Returns an object with pagination info or null in case of error.
 */
async function getPages(next, page, pageSize, query) {
  let pool; // Declare the pool variable to hold the database connection pool

  try {
    logger.info(`Pagination Get Pages : Connecting to the database...`);

    // Create a connection pool to the database using the configuration from DB_ReportingElements
    pool = new sql.ConnectionPool(config.DB_ReportingElements);

    // Establish the database connection
    await pool.connect();
    logger.info(
      "Pagination Get Pages : Database connection established successfully"
    );

    // Execute the provided SQL query and retrieve the result
    const result = await pool.request().query(query);

    // Get the total count from the result (assuming the total is in the first recordset)
    const count = result?.recordset[0]?.total;

    // Log the count and the query execution result
    logger.info(
      `Pagination Get Pages : Query executed successfully. Total records: ${count}`
    );

    // Return pagination details along with the count of records
    return {
      page: Number(page), // Ensure page is a number
      pageSize: Number(pageSize), // Ensure pageSize is a number
      offset: Number(page) * Number(pageSize), // Calculate the offset for pagination
      total: Number(count), // Return the total number of records
    };
  } catch (error) {
    // Log the error message and stack trace if an exception occurs
    error.message = `Pagination Get Pages : ${error?.message}`;
    next(error);
    // Return null in case of any error during the database operation
    return null;
  } finally {
    // Always close the connection pool once the operation is done, regardless of success or failure
    if (pool) {
      try {
        await pool.close();
        logger.info(
          "Pagination Get Pages : Database connection pool closed successfully"
        );
      } catch (error) {
        // Log any error that occurs while closing the connection pool
        error.message = `Pagination Get Pages : ${error?.message}`;
        next(error);
      }
    }
  }
}

module.exports = {
  getPages,
};
