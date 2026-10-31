require("dotenv").config();

let config = {
  server: {
    port: parseInt(process.env.SERVER_PORT) || 4000,
  },
  connectionString: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_USER_DATABASE,
    options: {
      encrypt: process.env.DB_OPTIONS_ENCRYPT === true, // Use this if you're on Windows Azure
      enableArithAbort: process.env.DB_OPTIONS_ENABLE_ARITH_ABORT === true, // Use this if you're on Windows Azure
    },
    pool: {
      max: parseInt(process.env.DB_POOL_MAX),
      min: parseInt(process.env.DB_POOL_MIN),
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MILLIS),
    },
  },
  password: {
    saltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS) || 10,
  },
  roles: {
    sysAdmin: 1,
    admin: 2,
    chefEquipe: 3,
    technicien: 4,
  },
  token: {
    access: {
      secretKey: process.env.ACCESS_TOKEN_SECRET,
      // expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRY || 60) * 60,//min
      expiresIn: 120

    },
    refresh: {
      secretKey: process.env.REFRESH_TOKEN_SECRET,
      // expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRY || 30) * 24 * 60 * 60,//day
      expiresIn: 300,//min
    },
  },
};

module.exports = { config };
