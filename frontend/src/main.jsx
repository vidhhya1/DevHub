import React from "react";
import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
} from "react-router-dom";

import {
  Toaster,
} from "react-hot-toast";

import App from "./App";
import "./index.css";

import {
  AuthProvider,
} from "./context/AuthContext";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>

    <BrowserRouter>

      <AuthProvider>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#10131A",
              color: "#fff",
              fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
              fontSize: "0.875rem",
              borderRadius: "9px",
              boxShadow: "0 16px 40px rgba(16, 19, 26, 0.24)",
              padding: "10px 14px",
            },
            success: {
              iconTheme: {
                primary: "#12B76A",
                secondary: "#10131A",
              },
            },
            error: {
              iconTheme: {
                primary: "#E11D48",
                secondary: "#10131A",
              },
            },
          }}
        />

        <App />

      </AuthProvider>

    </BrowserRouter>

  </React.StrictMode>
);