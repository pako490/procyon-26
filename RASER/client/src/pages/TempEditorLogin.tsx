import { useNavigate } from "react-router-dom";
import "../App.css";

function TempEditorLogin() {
    const navigate = useNavigate();

    return (
        <main className="editor-login editor-page">
            <section className="editor-card editor-login-card">
                <h1>Welcome, Editor</h1>
                <p>TODO: AUTH</p>
                <button type="button" onClick={() => navigate("/your-journals")}>
                    Login
                </button>
            </section>
        </main>
    );
}

export default TempEditorLogin;
