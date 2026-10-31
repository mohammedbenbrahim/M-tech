import axios from "axios";
import LocalStore from "../utils/storage";
import createApiInstance from "./axiosInterceptor";
import Toast from "react-native-toast-message";

// Reuse the same API instance across multiple functions
let api: any;

const initApi = async () => {
  if (!api) api = await createApiInstance();
};

export const login = async (username: string, password: string) => {
  try {
    // Define the payload for the login request
    const payload = { username, password };

    await initApi();
    const response = await api.post("/auth/login", payload);
    await LocalStore.set(
      "application-access-token",
      response.data?.token?.access
    );
    await LocalStore.set(
      "application-refresh-token",
      response.data?.token?.refresh
    );

    console.log("✅ Authentification réussie !");
    return {
      id: "123",
      name: "Nouressaid",
      fullName: "Nouressaid Ahmed",
      email: "a.nouressaid@autohall.ma",
      role: "technicien",
    };
  } catch (error) {
    console.error("❌ Échec de la connexion :", error);
    let message;
    // Detailed error logging
    if (error?.response) {
      console.error("🛑 Status:", error?.response?.status);
      console.error("📩 Message:", error?.response?.message);
      message = error?.response?.message;
    } else {
      console.error("💥 Message:", error?.message);
      message = error?.message;
    }

    throw new Error(
      message ||
        "Identifiants incorrects ou problème de connexion. Veuillez réessayer."
    );
  }
};

// Function to get user data
export const getUserData = async () => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return mock data
    return {
      id: "123",
      name: "Nouressaid",
      email: "a.nouressaid@autohall.ma",
      role: "technicien",
    };

    // Real implementation:
    // await initApi();
    // const response = await api.get("/ville");
    // console.log(response.data);
  } catch (error) {
    console.error("Erreur lors de l'obtention des données utilisateur:", error);
    throw error;
  }
};

// Function to get user profile
export const getUserProfile = async () => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return mock data
    return {
      name: "Nouressaid Ahmed",
      email: "a.nouressaid@autohall.ma",
      phone: "+212 600 654 065",
      site: "AutoHall Rabat",
      joinDate: "Vendredi 01 Septembre 2023",
      bio: "Software developer with expertise in mobile application development.",
      marque: "Ford",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    };

    // Real implementation:
    // await initApi();
    // const response = await api.get("/ville");
    // console.log(response.data);
  } catch (error) {
    console.error("Erreur lors de l'obtention du profil utilisateur:", error);
    throw error;
  }
};

// Function to update password
export const updatePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate validation
    if (currentPassword === "wrongpassword") {
      throw new Error("Le mot de passe actuel est incorrect.");
    }

    // Return success
    return { success: true };

    // Real implementation:
    // await initApi();
    // const response = await api.get("/ville");
    // console.log(response.data);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mot de passe:", error);
    throw error;
  }
};

export const getOperationHistorique = async (or: string) => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const data = [
      {
        title: "Vidange d'huile moteur avec remplacement du filtre",
        status: "inprogress" as const,
        username: "sarah.dev",
        passeTime: 90000, // 25 hours in seconds
        pauseTime: 18000, // 5 hours in seconds
        totalTime: 108000, // 30 hours in seconds
      },
      {
        title: "Remplacement des plaquettes de frein avant et arrière",
        status: "initial" as const,
        username: "mike.designer",
        passeTime: 54000, // 15 hours in seconds
        pauseTime: 10800, // 3 hours in seconds
        totalTime: 64800, // 18 hours in seconds
      },
      {
        title: "Changement de la boîte de vitesses automatique",
        status: "paused" as const,
        username: "alex.engineer",
        passeTime: 72000, // 20 hours in seconds
        pauseTime: 25200, // 7 hours in seconds
        totalTime: 97200, // 27 hours in seconds
      },
      {
        title: "Remplacement de l'embrayage et contrôle du volant moteur",
        status: "end" as const,
        username: "lisa.pm",
        passeTime: 108000, // 30 hours in seconds
        pauseTime: 7200, // 2 hours in seconds
        totalTime: 115200, // 32 hours in seconds
      },
    ];

    // Return mock data
    return data;

    // Real implementation:
    // await initApi();
    // const response = await api.get("/ville");
    // console.log(response.data);
  } catch (error) {
    console.error("Erreur lors de l'obtention des données opérations:", error);
    throw error;
  }
};

//linked to srever directly

//start operation
export const startOperation = async (operation: number): Promise<boolean> => {
  try {
    // Initialize the API before making the request
    await initApi();

    // Send a PUT request to start the operation
    const response = await api.put("/operation/start", { operation });

    // Optionally, you can show a success message using Toast
    Toast.show({
      type: "success",
      position: "bottom",
      text1: "Opération démarrée",
      text2: "L'opération a bien démarré.",
    });
    return true;
  } catch (error: any) {
    // Log the error to the console
    console.error("Erreur lors du démarrage de l'opération:", error);

    // Show error notification using Toast
    const errorMessage =
      error?.response?.data?.message || "Une erreur est survenue"; // Fallback message
    Toast.show({
      type: "error",
      position: "bottom",
      text1: "Erreur",
      text2: errorMessage,
    });

    // Rethrow the error for further handling if needed
    return false;
  }
};

//stop operation
export const stopOperation = async (
  operation: number,
  motif: number,
  comment: string
): Promise<boolean> => {
  try {
    // Initialize the API before making the request
    await initApi();

    // Send a PUT request to stop the operation
    const response = await api.put("/operation/stop", {
      operation,
      motif,
      comment,
    });

    // Show a success notification using Toast
    Toast.show({
      type: "success",
      position: "bottom",
      text1: "Opération arrêtée",
      text2: "L'opération a bien été arrêtée.",
    });
    return true;
  } catch (error: any) {
    // Log the error to the console
    console.error("Erreur lors de l'arrêt de l'opération:", error);

    // Show error notification using Toast
    const errorMessage =
      error?.response?.data?.message || "Une erreur est survenue"; // Fallback message
    Toast.show({
      type: "error",
      position: "bottom",
      text1: "Erreur",
      text2: errorMessage,
    });

    // Return false for failure
    return false;
  }
};

//finish operation
export const finishOperation = async (operation: number): Promise<boolean> => {
  try {
    // Initialize the API before making the request
    await initApi();

    // Send a PUT request to finish the operation
    const response = await api.put("/operation/finish", { operation });

    // Show a success notification using Toast
    Toast.show({
      type: "success",
      position: "bottom",
      text1: "Opération terminée",
      text2: "L'opération a bien été terminée.",
    });
    return true;
  } catch (error: any) {
    // Log the error to the console
    console.error("Erreur lors de la fin de l'opération:", error);

    // Show error notification using Toast
    const errorMessage =
      error?.response?.data?.message || "Une erreur est survenue"; // Fallback message
    Toast.show({
      type: "error",
      position: "bottom",
      text1: "Erreur",
      text2: errorMessage,
    });

    // Return false for failure
    return false;
  }
};

//get ordre réparation data
export const getOrData = async () => {
  try {
    await initApi();
    const response = await api.get("/order-reparation/get");
    return response?.data?.data;
  } catch (error) {
    console.error(
      "Erreur lors de l'obtention des ordres de réparation:",
      error
    );
    throw error;
  }
};

//get operations list data
export const getOperationListData = async (or: number) => {
  try {
    await initApi();
    const response = await api.get("/operation/get/list", {
      params: {
        or: or,
      },
    });
    return response?.data?.data;
  } catch (error) {
    console.error(
      "Erreur lors de l'obtention des données opérations : ",
      error?.message
    );
    throw error;
  }
};

//get operations list data
export const getOperationData = async (operation: number) => {
  try {
    await initApi();
    const response = await api.get("/operation/get/operation", {
      params: {
        operation: operation,
      },
    });
    return response?.data?.data;
  } catch (error) {
    console.error(
      "Erreur lors de l'obtention des données opérations : ",
      error?.message
    );
    throw error;
  }
};

//get motif list data
export const getListMotifs = async () => {
  try {
    await initApi();
    const response = await api.get("/operation/motifs");
    return response?.data?.data;
  } catch (error) {
    console.error("Erreur lors de l'obtention de la liste des motifs:", error);
    throw error;
  }
};
export default api;