import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./app/providers/AuthProvider";
import "./styles/index.css";

// Get root element safely
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("❌ Root element with id 'root' was not found in index.html");
}

// Create React root
const root = createRoot(rootElement);

// Render application
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);