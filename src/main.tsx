// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// Bridge ZUERST initialisieren - vor allem anderen
import { initDesignerBridge } from "./modules/cv-designer/bridge";
initDesignerBridge();

// Styles (so lassen wie im Projekt)
import "./index.css";
// ggf. tokens.css wird in App oder hier importiert
// import "./styles/tokens.css";

// Einmalige Registrierung der Designer-Exportstrategien
import "@/bootstrap/exportRegistry";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
