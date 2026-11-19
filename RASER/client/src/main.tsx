import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import type { ReactNode } from "react";
import './index.css'
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter, useNavigate } from "react-router-dom";

import App from './App.tsx'
import { ApiTokenProvider } from "./auth/ApiTokenProvider";

function Auth0ProviderWithRouter({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: "openid profile email",
      }}
      // navigate to the proper window (home page if no such in history) after Auth0 screen returns to RASER (linking to occur next)
      onRedirectCallback={(appState) => {
        navigate(appState?.returnTo ?? "/", { replace: true });
      }}
    >
      {children}
    </Auth0Provider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    {/* Auth0ProviderWithRouter must be nested in BrowserRouter to be able to use navigate above */}
      <Auth0ProviderWithRouter>
        <ApiTokenProvider>
          <App />
        </ApiTokenProvider>
      </Auth0ProviderWithRouter>
    </BrowserRouter>
  </StrictMode>,
)
