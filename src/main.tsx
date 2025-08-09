import { createRoot } from "react-dom/client";
import App from "./App";
import {
  BrowserRouter,
  useInRouterContext,
} from "react-router-dom";

// Global Styles
import "./styles/tokens.css";
import "./index.css";
import "react-quill/dist/quill.snow.css";

// Wrapper, der nur dann einen Router hinzufügt, wenn keiner existiert.
// So crasht useRoutes() nie – auch wenn App mal ohne Router gerendert wird
// (z. B. in einem zweiten Entry).
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
