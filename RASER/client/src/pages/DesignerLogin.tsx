import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../App.css";

function DesignerLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // authentication not implemented yet
    
        if (!email.trim() || !password.trim()) {
            setError("Please enter your email and password.");
            return;
        }

        navigate("/your-rubrics");
    }

    return (
        <main className="designer-login">
            <section className="login-section">
                <h1>Welcome, Designer</h1>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Email"
                        required
                    />
                    
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Password"
                        required
                    />
                    <button className="login-button" type="submit">Login</button>
                </form>
            </section>
        </main>
    )
}

export default DesignerLogin;