import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import App from "./App.tsx";
import "./index.css";
// Import production security measures
import "./lib/productionSecurity.ts";
import { isDevelopment } from "./lib/productionSecurity";
import { configurePiSDKForDevelopment, mockPiSDKForDevelopment } from "./lib/developmentConfig";

if (isDevelopment) {
  // Configure Pi SDK for development environment
  configurePiSDKForDevelopment();
  mockPiSDKForDevelopment();
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
