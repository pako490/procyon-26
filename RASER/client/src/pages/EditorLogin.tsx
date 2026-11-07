
import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "../App.css";
import LoginButton from "../components/LoginButton";
import TempEditorLogin from "./TempEditorLogin";

function EditorLogin() {
//   const {
//     isAuthenticated,
//     isLoading
//   } = useAuth0();

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (isAuthenticated) {
//     return <Navigate to="/your-journals" replace />;
//   }

//   return (
//     <main className="designer-login">
//       <section className="login-section">
//         <h1>Welcome, Editor</h1>
//         <LoginButton/>
//       </section>
//     </main>
//   );
return <TempEditorLogin />}

export default EditorLogin;
