import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

class LocalStore {
  constructor() {}

  // Helper method to validate key and value
  validateKeyValue(key: string, value = undefined) {
    if (!key || typeof key !== "string") {
      console.error("La clé est invalide ou manquante.");
      return false;
    }
    if (value !== undefined && typeof value !== "string") {
      console.error("La valeur doit être une chaîne de caractères.");
      return false;
    }
    return true;
  }

  // Set a value in SecureStore
  async set(key: string, value: any) {
    try {
      // if (!this.validateKeyValue(key, value)) return;
      await SecureStore.setItemAsync(key, JSON.stringify(value));
    } catch (error) {
      console.error(
        `Erreur lors de l'enregistrement de la clé "${key}":`,
        error
      );
    }
  }

  // Get a value from SecureStore
  async get(key: string) {
    try {
      if (!this.validateKeyValue(key)) return null;
      const value = await SecureStore.getItemAsync(key);
      if (value === null) {
        console.warn(`Aucune valeur trouvée pour la clé "${key}".`);
      }
      return JSON.parse(value);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de la clé "${key}":`,
        error
      );
      return null;
    }
  }

  // Remove a value from SecureStore
  async remove(key: string) {
    try {
      if (!this.validateKeyValue(key)) return;
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Erreur lors de la suppression de la clé "${key}":`, error);
    }
  }

  // Clear all stored data in SecureStore
  async clearAll() {
    try {
      const keys = await SecureStore;
      await Promise.all(keys.map(key => SecureStore.deleteItemAsync(key)));
      console.log("Toutes les données ont été effacées avec succès.");
    } catch (error) {
      console.error("Erreur lors de la suppression de toutes les données:", error);
    }
  }

  async getTokenCredential() {
    try {
      const value = await Constants?.expoConfig?.extra?.WSO2?.TOKEN;
      return value;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des valeurs de WSO2:`,
        error
      );
      return null;
    }
  }

  async getApiBaseUrl() {
    try {
      const value = await Constants?.expoConfig?.extra?.WSO2?.API_BASE_URL;
      return value;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des valeurs de api base url:`,
        error
      );
      return null;
    }
  }
}

export default new LocalStore();
