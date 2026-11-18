
import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "../App.css";
import LoginButton from "../components/LoginButton";

function DesignerLogin() {
  const {
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
        <LoginButton/>
      </section>
    </main>
  );
}

export default DesignerLogin;
