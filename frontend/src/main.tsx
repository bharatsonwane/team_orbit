import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./contexts/AuthContextProvider";
import { store } from "./redux/store";

import { ChatProvider } from "@/contexts/ChatContextProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <Router>
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            <ChatProvider>
              <App />
            </ChatProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </Provider>
  </StrictMode>
);
