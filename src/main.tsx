import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { BladeProvider } from "@razorpay/blade/components";
import { bladeTheme } from "@razorpay/blade/tokens";
// import "@razorpay/blade/fonts/index.css";
// import "@razorpay/blade/style/index.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BladeProvider themeTokens={bladeTheme}>
      <App />
    </BladeProvider>
  </StrictMode>
);
