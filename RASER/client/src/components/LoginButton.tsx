import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <button 
      onClick={() => loginWithRedirect({
                  authorizationParams: {
            connection: "Username-Password-Authentication",
          },
          appState: {
            // redirects to login page again after signing in with Auth0 succeeds to streamline to syncing/linking page
            returnTo: "/designer-login",
          },
        })
      }
      className="button login"
    >
      Log In
    </button>
  );
};

export default LoginButton;