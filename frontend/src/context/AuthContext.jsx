import {
  useEffect,
  useState,
} from "react";

import { getCurrentUser } from "../services/authService";
import { AuthContext } from "./AuthContextObject";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");

      return storedUser
        ? JSON.parse(storedUser)
        : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");

      if (!access && !refresh) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();

        setUser(response.data);

        localStorage.setItem(
          "user",
          JSON.stringify(response.data)
        );
      } catch (error) {
        console.error(
          "Unable to restore session:",
          error
        );

        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  function login(userData) {
    setUser(userData);

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );
  }

  function logout() {
    setUser(null);

    localStorage.removeItem("user");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("selectedProjectId");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}