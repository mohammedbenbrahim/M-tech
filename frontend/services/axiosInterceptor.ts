import axios, { AxiosInstance } from "axios";
import LocalStore from "../utils/storage";
import { router } from "expo-router";
import { checkToken } from "@/utils/checkToken";

// console.log("✅ Access Token:", response.data.access_token);
// console.log("🔒 Token Type:", response.data.token_type);
// console.log("⏳ Expires in (seconds):", response.data.expires_in);

// Create and configure the Axios instance
const createApiInstance = async (): Promise<AxiosInstance> => {
  const API_BASE_URL = await LocalStore.getApiBaseUrl();

  console.log("API Base URL is: ", API_BASE_URL);

  const apiInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  setupInterceptors(apiInstance);

  return apiInstance;
};

// Set up interceptors for requests to handle tokens
const setupInterceptors = (apiInstance: AxiosInstance) => {
  apiInstance.interceptors.request.use(
    async (config) => {
      const wso2Token = await getWSO2Token(); // Function for getting the WSO2 token
      const accessToken = await getApplicationAccessToken();

      // console.log(
      //   "✅ Access Token of WSO2 from setup Interceptors is:",
      //   wso2Token
      // );
      // console.log(
      //   "✅ Access Token of WSO2 from setup Interceptors is:",
      //   accessToken
      // );

      config.headers.Authorization = `Bearer ${wso2Token}`;
      config.headers["application-access-token"] = accessToken;
      console.log("🔒 End setup config");

      return config;
    },
    (error) => Promise.reject(error)
  );
};

// Function to generate a new token from WSO2
const generateWSO2Token = async () => {
  try {
    console.log("⏳ Start Generating WSO2 Access Token .........");

    const credential = await LocalStore.getTokenCredential();

    const tokenParams = new URLSearchParams();
    tokenParams.append("grant_type", "client_credentials");
    tokenParams.append("client_id", credential?.IDENTIFIANT);
    tokenParams.append("client_secret", credential?.SECRET);

    console.info(
      "🔒 Credential grant_type from generate WSO2 token is:",
      "client_credentials"
    );
    console.info(
      "🔒 Credential grant_type from generate WSO2 token is:",
      credential?.IDENTIFIANT
    );
    console.info(
      "🔒 Credential grant_type from generate WSO2 token is:",
      credential?.SECRET
    );

    const response = await axios.post(credential?.URL, tokenParams);
    console.log(
      "✅ Generated WSO2 Access Token from generate WSO2 token is :",
      response.data
    );

    console.log(
      "⏳ Start Set WSO2 Access Token Local Store from generate WSO2 token ........."
    );
    await LocalStore.set("wso2-token", response.data);
    console.log(
      "⏳ End Set WSO2 Access Token Local Store from generate WSO2 token ........."
    );

    return response.data;
  } catch (error: any) {
    console.error("❌ Failed to fetch wso2 access token");
    if (error.response) {
      console.error("🛑 Status:", error.response.status);
      console.error("📩 Response Data:", error.response.data);
    } else {
      console.error("💥 Error Message:", error.message);
    }
    throw new Error(
      "Échec de l'authentification. Veuillez vérifier vos identifiants."
    );
  }
};

// Function to generate a new token from WSO2
const generateApplicationAccessToken = async () => {
  try {
    console.log("⏳ Start Generating Application Access Token .........");

    const stored_token = await getApplicationRefreshToken();
    console.log("Access token is : ", stored_token);
    if (stored_token) {
      const API_BASE_URL = await LocalStore.getApiBaseUrl();
      const wso2_token = await getWSO2Token();
      const response = await axios.post(
        API_BASE_URL + "/auth/refresh-token",
        {
          token: stored_token,
        },
        { headers: { Authorization: `Bearer ${wso2_token}` } }
      );

      await LocalStore.set(
        "application-access-token",
        response.data.token?.access
      );
      return response.data.token?.access;
    } else {
      await LocalStore.remove("user");
      await LocalStore.remove("application-access-token");
      await LocalStore.remove("application-refresh-token");
      await LocalStore.set("rememberMe", "false");
      router.replace("/(auth)/login");
    }
  } catch (error: any) {
    console.error("❌ Failed to fetch access token for generate application access token");
    if (error.response) {
      console.error("🛑 Status:", error.response.status);
      console.error("📩 Response Data:", error.response.data);
    } else {
      console.error("💥 Error Message:", error.message);
    }
    throw new Error(
      "Échec de l'authentification. Veuillez vérifier vos identifiants."
    );
  }
};

// Function to fetch or regenerate the token
const getApplicationAccessToken = async (): Promise<string | null> => {
  try {
    console.log("⏳ Start Getting Application Access Token .........");

    const stored_token = await LocalStore.get("application-access-token");

    if (checkToken(stored_token)) {
      return stored_token?.token;
    }
    const generated_token = await generateApplicationAccessToken();
    return generated_token?.token;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};
// Function to fetch or regenerate the token
const getApplicationRefreshToken = async (): Promise<string | null> => {
  try {
    console.log("⏳ Start getting Application refresh Token .........");

    const stored_token = await LocalStore.get("application-refresh-token");
    if (checkToken(stored_token)) {
      return stored_token?.token;
    }
    console.info("💥 Refresh token not exist or is expired.");
    return null;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

// Function to fetch or regenerate the token
const getWSO2Token = async (): Promise<string | null> => {
  try {
    console.log("⏳ Start Getting WSO2 Access Token .........");
    const date = new Date();
    let stored_token = await LocalStore.get("wso2-token");
    const expires_in = new Date(stored_token?.expires_in);

    if (expires_in.getTime() > date.getTime()) {
      return stored_token?.token;
    }
    const generated_token = await generateWSO2Token();
    date.setSeconds(date.getSeconds() + parseInt(generated_token?.expires_in));
    await LocalStore.set("wso2-token", {
      token: generated_token?.access_token,
      expires_in: date,
    });
    return generated_token?.access_token;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

export default createApiInstance;
