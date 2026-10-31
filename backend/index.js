require("dotenv").config();

const express = require("express");
const WebSocket = require("ws");
const http = require("http"); // Import HTTP module
const sql = require("mssql");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { mainLogger } = require("./utils/logger");
const { config } = require("./config");

const authRoutes = require("./routes/auth.route");
const orderReparationRoutes = require("./routes/order-reparation.route");
const operationRoutes = require("./routes/operation.route");



// Initialize Express app
const app = express();

// Access variables
const port = config?.server?.port;

// Middlewares
const { isAuth } = require("./middlewares/auth.middlewares");
app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true); // Accept the request
    },
  })
);

app.use(express.json());
app.use(cookieParser());

// Middleware to log incoming HTTP requests
app.use((req, res, next) => {
  mainLogger.info(`[HTTP] ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Create an HTTP server and integrate with Express
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on("connection", (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  mainLogger.info(`[WS] New WebSocket connection from ${clientIp}`);

  ws.on("message", (message) => {
    mainLogger.info(
      `[WS] Received message: ${message.toString()} from ${clientIp}`
    );

    // Broadcast message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    mainLogger.info(`[WS] WebSocket connection closed: ${clientIp}`);
  });

  ws.send("Welcome to WebSocket Server!");
});

// Define a simple route
app.get("/", (req, res) => {
  mainLogger.info("[HTTP] GET / - Server health check");
  res.send("Express server with WebSocket is running!");
});
app.get("/protected", isAuth, (req, res) => {
  res.json({ message: "Accès autorisé", user: req.user });
});
app.get("/test-db", isAuth, async (req, res) => {
  try {
    // Connect to the database
    const pool = await sql.connect(config?.connectionString);
    mainLogger.info("✅ Connected to SQL Server successfully.");

    // Query the users table to verify access
    const result = await pool.request().query("SELECT TOP 5 * FROM users");

    mainLogger.info("✅ Users Data Retrieved", result.recordset);
    await pool.close();

    res.status(200).json({
      success: true,
      message: "Database connection successful!",
      data: result.recordset,
    });
  } catch (error) {
    mainLogger.error("❌ Database connection failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed!",
      error: error.message,
    });
  }
});

// Routes
app.use("/auth", authRoutes);
app.use("/order-reparation", orderReparationRoutes);
app.use("/operation", operationRoutes);

// Start the server
server.listen(port, () => {
  mainLogger.info(`Server is running on port ${port}`);
});
