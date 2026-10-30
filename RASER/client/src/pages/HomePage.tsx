import { Link } from "react-router-dom";
import "../App.css";

function HomePage() {
    return (
        <main className="home-page">
            <section className="welcome-section">
                <h1>Welcome to RASER</h1>
                <p>Rubric for Assessing Scientific Experimental Research</p>
                <div className="login-buttons">
                    <Link to="/editor-login" className="login-button">
                        Log in as an Editor
                    </Link>
                    <Link to="/designer-login" className="login-button">
                        Log in as an Designer
                    </Link>
                    <Link to="/register-user" className="login-button">
                        Register as a New User
                    </Link>
                </div>
            </section>
        </main>
    )
}

export default HomePage;