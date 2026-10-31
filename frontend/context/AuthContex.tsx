import React, { createContext, useState, useContext, useEffect } from "react";
import LocalStore from "../utils/storage";
import { useRouter, useSegments } from "expo-router";
import { login as loginEndPoint } from "../services/api";
import { checkToken } from "@/utils/checkToken";

interface User {
  username: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Check authentication status on app start
  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const storedUser = await LocalStore.get("user");
        const rememberMe = await LocalStore.get("rememberMe");
        const token = await LocalStore.get("application-refresh-token");

        if (checkToken(token) && storedUser && rememberMe === "true") {
          setUser(storedUser); // Restore user only if rememberMe is true
        } else {
          await LocalStore.remove("user");
        }
      } catch (error) {
        console.error("❌ Erreur lors de la récupération de l'utilisateur:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAuth();
  }, []);

  // Handle route protection logic
  useEffect(() => {
    if (!isLoading) {
      const inAuthGroup = segments[0] === "(auth)";

      if (!user && !inAuthGroup) {
        router.replace("/(auth)/login");
      } else if (user && inAuthGroup) {
        router.replace("/(tabs)");
      }
    }
  }, [user, segments, isLoading]);

  // ✅ Login function
  const login = async (username: string, password: string, rememberMe: boolean) => {
    try {
      setIsLoading(true);

      // Call API login endpoint
      const userData = await loginEndPoint(username, password);

      // Store rememberMe value and user data (conditionally)
      await LocalStore.set("rememberMe", rememberMe.toString());

      if (rememberMe) {
        await LocalStore.set("user", userData);
      }

      setUser(userData);
    } catch (error) {
      console.error("❌ Erreur de connexion:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 🚪 Logout function
  const logout = async () => {
    try {
      await LocalStore.remove("user");
      await LocalStore.remove("application-access-token");
      await LocalStore.remove("application-refresh-token");
      await LocalStore.remove("wso2-token");
      await LocalStore.set("rememberMe", "false");
      setUser(null);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("❌ Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Custom hook for easy access to auth state
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("⚠️ useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};