import { useState } from "react";
import api from "../api/axios";

interface Rubric {
    id: number;
    assignedDesignerId: number;
    title: string;
    maxScoreComputed: number;
    lowQualThreshold: number;
    highQualThreshold: number;
    sampleURL: string;
}

interface CreateRubricProps {
    onRubricCreated: () => void | Promise<void>;
}

function CreateRubric({ onRubricCreated }: CreateRubricProps) {
    const [assignedDesignerId, setAssignedDesignerId] = useState<number | "">(""); //TODO: Remove this 
    const [title, setTitle] = useState("");
    const [lowQualThreshold, setLowQualThreshold] = useState<number | "">("");
    const [highQualThreshold, setHighQualThreshold] = useState<number | "">("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
        evt.preventDefault();
        setError("");
        setSuccess("");

        if (
            assignedDesignerId === "" ||
            title.trim() === "" ||
            lowQualThreshold === "" ||
            highQualThreshold === "" 
        ) {
            setError("All fields are required.");
            return;
        }

        if (
            !Number.isInteger(assignedDesignerId) ||
            !Number.isInteger(lowQualThreshold) ||
            !Number.isInteger(highQualThreshold)
        ) {
            setError("ID and score values must be integers.");
            return;
        }

        try {
            const response = await api.post<Rubric>("/rubrics/create", {
                assignedDesignerId,
                title: title.trim(),
                lowQualThreshold,
                highQualThreshold
            });

            setSuccess(`Rubric "${response.data.title}" created successfully.`);


            await onRubricCreated();

            setTitle("");
            setAssignedDesignerId("");
            setLowQualThreshold("");
            setHighQualThreshold("");
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
                        <label htmlFor="assignedDesignerId">Assigned Designer ID:</label>
                        <input
                            type="number"
                            id="assignedDesignerId"
                            value={assignedDesignerId}
                            onChange={(e) => setAssignedDesignerId(Number(e.target.value))}
                            required
                        />
                    </div>
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
                    <div className="form-field">
                        <label htmlFor="lowQualThreshold">Low Quality Threshold:</label>
                        <input
                            type="number"
                            id="lowQualThreshold"
                            min="0"
                            value={lowQualThreshold}
                            onChange={(e) => setLowQualThreshold(Number(e.target.value))}
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="highQualThreshold">High Quality Threshold:</label>
                        <input
                            type="number"
                            id="highQualThreshold"
                            min="0"
                            value={highQualThreshold}
                            onChange={(e) => setHighQualThreshold(Number(e.target.value))}
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