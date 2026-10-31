const createLogger = require("./create");
const path = require("path");

// List of log categories
const logCategories = [
  "Main",
];

// Initialize loggers for each category
const loggers = logCategories.reduce((acc, category) => {
  acc[`${category.toLowerCase()}Logger`] = createLogger(
    path.join(__dirname, `../../logs/${category}`),
    // process.env.ENABLE_SQL_LOG === "true" // Enable SQL logging dynamically
  );
  return acc;
}, {});

module.exports = loggers;
