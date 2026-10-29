import { useState } from "react";
import api from "../api/axios";

interface Rubric {
    id: number;
    assignedDesignerId: number | null;
    title: string;
    maxScoreComputed: number | null;
    lowQualThreshold: number | null;
    highQualThreshold: number | null;
    sampleURL: string | null;
}

interface CreateRubricProps {
    onRubricCreated: () => void | Promise<void>;
}

function CreateRubric({ onRubricCreated }: CreateRubricProps) {
    const [title, setTitle] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
        evt.preventDefault();
        setError("");
        setSuccess("");

        if (title.trim() === "") {
            setError("Title is required.");
            return;
        }

        try {
            const response = await api.post<Rubric>("/rubrics/create", {
                title: title.trim()
            });

            setSuccess(`Rubric "${response.data.title}" created successfully.`);


            await onRubricCreated();
            setTitle("");
        } catch (error) {
            console.error(error);
            setError("Failed to create rubric.");
        }
    }

    return (
        <section className="create-rubric-section">
            <h1>Create New Rubric</h1>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <form className="create-rubric-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-field">
                        <label htmlFor="title">Rubric Title:</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <button type="submit">Create Rubric</button>
            </form>
        </section>
    )
}

export default CreateRubric;