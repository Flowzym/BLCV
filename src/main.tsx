// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

// Basis-Styles (lass diese Imports so, wie es in deinem Projekt ist)
import "./index.css";

// 🔗 Einmalige Export-Registrierung (wichtig!)
import "@/bootstrap/exportRegistry";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
