import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter, useInRouterContext } from "react-router-dom";

// Global Styles
import "./styles/tokens.css";
import "./index.css";
import "react-quill/dist/quill.snow.css";

// Guard: Falls App ohne Router gerendert wird (zweiter Entry, Tests, Extension),
// wird hier automatisch ein BrowserRouter drumgelegt.
function AppWithRouterGuard() {
  const inside = useInRouterContext();
  return inside ? <App /> : (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<AppWithRouterGuard />);
}
