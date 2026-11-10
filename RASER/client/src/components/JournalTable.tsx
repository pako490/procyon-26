import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

interface Journal {
    id: number;
    name: string;
}

export interface JournalTableRef {
    refresh: () => Promise<void>;
}

const JournalTable = forwardRef<JournalTableRef>(function JournalTable(_props, ref) {
    const navigate = useNavigate();
    const [journals, setJournals] = useState<Journal[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const response = await api.get<Journal[]>("/journals/all");
            setJournals(response.data);
            setError(null);
        } catch (fetchError) {
            console.error("Failed to fetch journals:", fetchError);
            setError("Failed to retrieve journals.");
        } finally {
            setLoading(false);
        }
    }, []);

    useImperativeHandle(ref, () => ({ refresh: () => refresh() }), [refresh]);

    useEffect(() => {
        void refresh(false);
    }, [refresh]);

    return (
        <section className="journal-list-section">
            {error && <p className="error-message" role="alert">{error}</p>}
            <table className="journal-table">
                <thead>
                    <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {journals.map((journal) => (
                        <tr key={journal.id}>
                            <td>{journal.name}</td>
                            <td className="journal-actions">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/your-journals/${journal.id}/dashboard`)}
                                >
                                    Show Dashboard
                                </button>
                                <button type="button" disabled>
                                    (Implement) Withdraw
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {loading && <p className="journal-status-message">Loading journals...</p>}
            {!loading && !error && journals.length === 0 && (
                <p className="journal-status-message">Nothing to display. Register a journal to get started.</p>
            )}
        </section>
    );
});

export default JournalTable;