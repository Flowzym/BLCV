// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// Styles (so lassen wie im Projekt)
import { initDesignerBridge } from "./modules/cv-designer/bridge";
import "./index.css";
// ggf. tokens.css wird in App oder hier importiert
// import "./styles/tokens.css";

// Einmalige Registrierung der Designer-Exportstrategien
import "@/bootstrap/exportRegistry";

// Sicherstellen, dass die Designer-Bridge frühzeitig initialisiert wird
initDesignerBridge();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
