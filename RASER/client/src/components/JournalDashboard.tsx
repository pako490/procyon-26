import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import "../App.css";

interface Journal {
    id: number;
    name: string;
}

function JournalDashboard() {
    const { journalId } = useParams();
    const navigate = useNavigate();
    const [journal, setJournal] = useState<Journal | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const loadJournal = async () => {
            if (!journalId) {
                setError("Invalid journal.");
                setLoading(false);
                return;
            }

            try {
                const response = await api.get<Journal>(`/journals/dashboard/${journalId}`);
                if (active) {
                    setJournal(response.data);
                    setError(null);
                }
            } catch (fetchError) {
                console.error("Failed to fetch journal dashboard:", fetchError);
                if (active) setError("Failed to load journal dashboard.");
            } finally {
                if (active) setLoading(false);
            }
        };

        void loadJournal();
        return () => { active = false; };
    }, [journalId]);

    return (
        <main className="editor-page">
            <section className="editor-card journal-dashboard">
                <header className="editor-page-header">
                    <h1>{journal ? `${journal.name} Dashboard` : "Journal Dashboard"}</h1>
                    <button type="button" className="secondary-button" onClick={() => navigate("/your-journals")}>
                        Return to All Journals
                    </button>
                </header>

                {loading && <p className="journal-status-message">Loading journal...</p>}
                {error && <p className="error-message" role="alert">{error}</p>}

                {!loading && journal && (
                    <>
                        <form className="issue-form" onSubmit={(event) => event.preventDefault()}>
                            <label className="visually-hidden" htmlFor="issue-volume">Issue volume number</label>
                            <input id="issue-volume" placeholder="Enter Issue Volume Number" />
                            <label className="visually-hidden" htmlFor="issue-number">Issue number</label>
                            <input id="issue-number" placeholder="Enter Issue Number" />
                            <button type="submit">Add Issue</button>
                        </form>

                        <table className="journal-table issue-table">
                            <thead>
                                <tr>
                                    <th scope="col">Issue</th>
                                    <th scope="col">Issue Actions</th>
                                    <th scope="col">Papers</th>
                                    <th scope="col">Paper Actions</th>
                                </tr>
                            </thead>
                        </table>
                        <p className="journal-status-message">Nothing to display. Add an issue to get started.</p>

                        <aside className="associated-rubrics-placeholder">
                            TODO: editor must be able to view associated rubrics
                        </aside>
                    </>
                )}
            </section>
        </main>
    );
}

export default JournalDashboard;