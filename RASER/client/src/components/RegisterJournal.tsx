import { useState } from "react";
import api from "../api/axios";

interface Journal {
    id: number;
    name: string;
}

interface RegisterJournalProps {
    onJournalRegistered: () => void | Promise<void>;
}

function RegisterJournal({ onJournalRegistered }: RegisterJournalProps) {
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const journalName = name.trim();
        if (!journalName) {
            setError("Journal name is required.");
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            await api.post<Journal>("/journals/register", { name: journalName });
            setName("");
            await onJournalRegistered();
        } catch (submitError) {
            console.error("Failed to register journal:", submitError);
            setError("Failed to register journal.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="register-journal-section">
            <form className="register-journal-form" onSubmit={handleSubmit}>
                <label className="visually-hidden" htmlFor="journal-name">
                    Journal name
                </label>
                <input
                    id="journal-name"
                    type="text"
                    placeholder="Enter Journal Name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                />
                <button type="submit" disabled={submitting}>
                    {submitting ? "Registering..." : "Register Journal"}
                </button>
            </form>
            {error && <p className="error-message" role="alert">{error}</p>}
        </section>
    );
}

export default RegisterJournal;