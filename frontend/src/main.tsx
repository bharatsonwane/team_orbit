import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./contexts/AuthContextProvider";
import { store } from "./redux/store";
import { SocketProvider } from "./contexts/SocketProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <Router>
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            <SocketProvider>
              <App />
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </Provider>
  </StrictMode>
);
