
import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "../App.css";

function DesignerLogin() {
  const {
    loginWithRedirect,
    isAuthenticated,
    isLoading
  } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/your-rubrics" replace />;
  }

  return (
    <main className="designer-login">
      <section className="login-section">
        <h1>Welcome, Designer</h1>

        <button
          className="login-button"
          onClick={() =>
            loginWithRedirect({
              appState: {
                returnTo: "/your-rubrics"
              }
            })
          }
        >
          Login with Auth0
        </button>
      </section>
    </main>
  );
}

export default DesignerLogin;
