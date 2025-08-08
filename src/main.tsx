import { createRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// Global Styles
import '@src/tokens.css';            // <-- liegt unter src/styles
import './index.css';
import 'react-quill/dist/quill.snow.css';

const container = document.getElementById('root');

if (container) {
  createRoot(container).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
