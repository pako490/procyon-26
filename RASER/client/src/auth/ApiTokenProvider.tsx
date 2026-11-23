import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import api from "../api/axios";

// used to pass bearer tokens with each API request instead of repeating code for each API request
export function ApiTokenProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const isAuthenticatedRef = useRef(isAuthenticated);
  const [interceptorReady, setInterceptorReady] = useState(false);

  isAuthenticatedRef.current = isAuthenticated;

  useEffect(() => {
    const interceptorId = api.interceptors.request.use(async (config) => {
      if (
        isAuthenticatedRef.current &&
        !config.headers.has("Authorization")
      ) {
        const token = await getAccessTokenSilently();
        config.headers.set("Authorization", `Bearer ${token}`);
      }

      return config;
    });

    setInterceptorReady(true);

    return () => {
      api.interceptors.request.eject(interceptorId);
    };
  }, [getAccessTokenSilently]);

  return interceptorReady ? children : null;
}
