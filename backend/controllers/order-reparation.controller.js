// controllers/auth.controller.js
const sql = require("mssql");
const { config } = require("../config");
const { mainLogger } = require("../utils/logger");

const get = async (req, res) => {
  try {
    const data = [
      {
        numOr: "12547863",
        marque: "Ford",
        model: "Focus",
        matricule: "78965 - C - 33",
        kilometrage: 45000,
        dateLivraison: "12/06/2024",
      },
      {
        numOr: "12654796",
        marque: "Opel",
        model: "Astra", 
        matricule: "15478 - D - 44",
        kilometrage: 32000,
        dateLivraison: "05/07/2024",
      },
      {
        numOr: "54518649",
        marque: "Fiat",
        model: "500",
        matricule: "32154 - E - 55",
        kilometrage: 15000,
        dateLivraison: "20/08/2024",
      },
      {
        numOr: "65518650",
        marque: "Jeep",
        model: "Cherokee",
        matricule: "65412 - F - 66",
        kilometrage: 50000,
        dateLivraison: "25/09/2024",
      },
    ];
    return res
      .status(200)
      .json({ success: true, message: "Data returned.", data: data });
  } catch (error) {
    mainLogger.error(`❌ Erreur de connexion: ${error.message}`);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

module.exports = { get };
