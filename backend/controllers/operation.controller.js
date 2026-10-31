const sql = require("mssql");
const { config } = require("../config");
const { mainLogger } = require("../utils/logger");

const motifs = async (req, res) => {
  let pool;
  try {
    pool = await sql.connect(config?.connectionString);
    const result = await pool.request()
      .query(`SELECT [id] AS [value],[name] AS [label]
        FROM [DB_MTechnicien].[dbo].[MotifsPause];`);
    return res.status(200).json({
      success: true,
      message: "Données retournées.",
      data: result?.recordset,
    });
  } catch (error) {
    mainLogger.error(`❌ Erreur : ${error.message}`);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};
const getListOperations = async (req, res) => {
  let pool;
  try {
    const { or } = req?.query;

    if (!or || isNaN(parseInt(String(or)))) {
      mainLogger.error("Le numéro d'OR est requis.");
      return res
        .status(400)
        .json({ success: false, message: "Le numéro d'OR est requis." });
    }
    pool = await sql.connect(config?.connectionString);
    const result = await pool.request().query(`SELECT *FROM [V_operation]`);

    // const data = [
    //   {
    //     id: 1,
    //     title: "Vidange d'huile moteur avec remplacement du filtre",
    //     status: "inprogress",
    //     username: "sarah.dev",
    //     passeTime: 90000, // 25 hours in seconds
    //     pauseTime: 18000, // 5 hours in seconds
    //     totalTime: 108000, // 30 hours in seconds
    //   },
    //   {
    //     id: 2,
    //     title: "Remplacement des plaquettes de frein avant et arrière",
    //     status: "initial",
    //     username: "mike.designer",
    //     passeTime: 54000, // 15 hours in seconds
    //     pauseTime: 10800, // 3 hours in seconds
    //     totalTime: 64800, // 18 hours in seconds
    //   },
    //   {
    //     id: 3,
    //     title: "Changement de la boîte de vitesses automatique",
    //     status: "paused",
    //     username: "alex.engineer",
    //     passeTime: 72000, // 20 hours in seconds
    //     pauseTime: 25200, // 7 hours in seconds
    //     totalTime: 97200, // 27 hours in seconds
    //   },
    //   {
    //     id: 4,
    //     title: "Remplacement de l'embrayage et contrôle du volant moteur",
    //     status: "end",
    //     username: "lisa.pm",
    //     passeTime: 108000, // 30 hours in seconds
    //     pauseTime: 7200, // 2 hours in seconds
    //     totalTime: 115200, // 32 hours in seconds
    //   },
    // ];
    return res.status(200).json({
      success: true,
      message: "Données retournées.",
      data: result?.recordset,
    });
  } catch (error) {
    mainLogger.error(`❌ Erreur : ${error.message}`);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

const getOperation = async (req, res) => {
  let pool;
  try {
    const { operation } = req?.query;

    if (!operation || isNaN(parseInt(String(operation)))) {
      mainLogger.error("Le numéro de l'operation est requis.");
      return res
        .status(400)
        .json({
          success: false,
          message: "Le numéro de l'operation est requis.",
        });
    }
    pool = await sql.connect(config?.connectionString);
    const result = await pool
      .request()
      .input("operation", sql?.BigInt, operation)
      .query(`SELECT *FROM [V_operation] WHERE [id] = @operation`);
    return res.status(200).json({
      success: true,
      message: "Données retournées.",
      data: result?.recordset[0],
    });
  } catch (error) {
    mainLogger.error(`❌ Erreur : ${error.message}`);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

const start = async (req, res) => {
  let pool;
  try {
    const { operation } = req?.body;
    console.log("request body for start function : ", req?.body);
    if (!operation || isNaN(parseInt(String(operation)))) {
      mainLogger.error(
        "Le numéro d'opération est requis pour démarrer cette opération."
      );
      return res
        .status(400)
        .json({ success: false, message: "Le numéro d'opération est requis." });
    }
    pool = await sql.connect(config?.connectionString);
    // Call the stored procedure `start_operation`
    await pool
      .request()
      .input("operationId", sql.BigInt, operation) // Pass the operationId parameter
      .execute("start_operation"); // Call the stored procedure

    return res
      .status(200)
      .json({ success: true, message: "Opération démarrée." });
  } catch (error) {
    mainLogger.error(`❌ Erreur : ${error.message}`);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

const stop = async (req, res) => {
  let pool;
  try {
    const { operation, motif, comment } = req?.body;
    console.log("request body for stop function : ", req?.body);

    if (!operation || isNaN(parseInt(operation))) {
      mainLogger.error(
        "Le numéro d'opération est requis pour arrêter cette opération."
      );
      return res
        .status(400)
        .json({ success: false, message: "Le numéro d'opération est requis." });
    }
    if (!motif || isNaN(parseInt(motif))) {
      mainLogger.error("Le motif est requis pour arrêter cette opération.");
      return res
        .status(400)
        .json({ success: false, message: "Le motif est requis." });
    }
    pool = await sql.connect(config?.connectionString);
    // Call the stored procedure `stop_operation`
    await pool
      .request()
      .input("operationId", sql.BigInt, operation) // Pass the operationId parameter
      .input("motif", sql.VarChar(sql.MAX), motif) // Pass the operationId parameter
      .input("comment", sql.VarChar(sql.MAX), comment) // Pass the operationId parameter
      .execute("stop_operation"); // Call the stored procedure

    return res
      .status(200)
      .json({ success: true, message: "Opération arrêtée." });
  } catch (error) {
    mainLogger.error(`❌ Erreur : ${error.message}`);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

const finish = async (req, res) => {
  let pool;
  try {
    const { operation } = req?.body;

    console.log("request body for finish function : ", req?.body);

    if (!operation || isNaN(parseInt(operation))) {
      mainLogger.error(
        "Le numéro d'opération est requis pour terminer cette opération."
      );
      return res
        .status(400)
        .json({ success: false, message: "Le numéro d'opération est requis." });
    }
    pool = await sql.connect(config?.connectionString);
    // Call the stored procedure `end_operation`
    await pool
      .request()
      .input("operationId", sql.BigInt, operation) // Pass the operationId parameter
      .execute("end_operation"); // Call the stored procedure

    return res
      .status(200)
      .json({ success: true, message: "Opération terminée." });
  } catch (error) {
    mainLogger.error(`❌ Erreur : ${error.message}`);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

module.exports = { getListOperations, getOperation, start, stop, finish, motifs };
