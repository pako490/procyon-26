import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import "../App.css";

interface Journal {
    id: number;
    name: string;
}

interface Rubric {
    id: number;
    title: string;
    publishDate: string;
    assignedToJournal: boolean;
}

type RubricView = "assigned" | "published";

function JournalDashboard() {
    const { journalId } = useParams();
    const navigate = useNavigate();
    const [journal, setJournal] = useState<Journal | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [rubrics, setRubrics] = useState<Rubric[]>([]);
    const [view, setView] = useState<RubricView>("assigned");
    const [rubricsError, setRubricsError] = useState<string | null>(null);
    const [rubricsLoading, setRubricsLoading] = useState(true);
    const [updatingAssignmentId, setUpdatingAssignmentId] = useState<number | null>(null);

    const fetchRubrics = useCallback(async (selectedView: RubricView) => {
        if (!journalId) {
            setRubricsError("Invalid journal.");
            setRubricsLoading(false);
            return;
        }

        setRubricsLoading(true);

        try {
            const response = await api.get<Rubric[]>(
                `/journals/${journalId}/rubrics`,
                { params: { view: selectedView } },
            );

            console.log("HTTP Status:", response.status);
            console.log("Received rubrics:", response.data);

            setRubrics(response.data);
            setRubricsError(null);
        } catch (fetchError) {
            console.error("Failed to fetch journal rubrics:", fetchError);
            setRubricsError("Failed to load rubrics.");
        } finally {
            setRubricsLoading(false);
        }
    }, [journalId]);

    const refreshRubrics = useCallback(
        () => fetchRubrics(view),
        [fetchRubrics, view],
    );

    const handleAssign = async (rubricId: number) => {
        if (!journalId) return;

        setUpdatingAssignmentId(rubricId);
        setRubricsError(null);
        try {
            await api.post(`/journals/${journalId}/assign-rubric/${rubricId}`);
            await refreshRubrics();
        } catch (assignError) {
            console.error(`Failed to assign rubric ${rubricId}:`, assignError);
            setRubricsError("Could not assign the rubric to this journal.");
        } finally {
            setUpdatingAssignmentId(null);
        }
    };

    const handleUnassign = async (rubricId: number) => {
        if (!journalId) return;

        setUpdatingAssignmentId(rubricId);
        setRubricsError(null);
        try {
            await api.delete(`/journals/${journalId}/unassign-rubric/${rubricId}`);
            await refreshRubrics();
        } catch (unassignError) {
            console.error(`Failed to unassign rubric ${rubricId}:`, unassignError);
            setRubricsError("Could not unassign the rubric from this journal.");
        } finally {
            setUpdatingAssignmentId(null);
        }
    };

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

    useEffect(() => {
        void fetchRubrics(view);
    }, [fetchRubrics, view]);

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

                        {/* Rendering for rubrics table */}

                        <section className="rubrics-list-section">
                            <h2>Journal Rubrics</h2>
                            <div className="rubrics-table-controls">
                                <div className="rubrics-view-slider" role="group" aria-label="Rubric view">
                                    <button
                                        type="button"
                                        className={view === "assigned" ? "active" : ""}
                                        aria-pressed={view === "assigned"}
                                        onClick={() => setView("assigned")}
                                    >
                                        Assigned Rubrics
                                    </button>
                                    <button
                                        type="button"
                                        className={view === "published" ? "active" : ""}
                                        aria-pressed={view === "published"}
                                        onClick={() => setView("published")}
                                    >
                                        Published Rubrics
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    className="refresh-button"
                                    onClick={() => void refreshRubrics()}
                                    disabled={rubricsLoading}
                                >
                                    {rubricsLoading ? "Refreshing..." : "Refresh"}
                                </button>
                            </div>

                            {rubricsError && <p className="error-message" role="alert">{rubricsError}</p>}

                            <table className="rubrics-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rubrics.map((rubric) => (
                                        <tr key={rubric.id}>
                                            <td>{rubric.title}</td>
                                            <td>Published</td>
                                            <td>
                                                {rubric.assignedToJournal && view === "published" ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleUnassign(rubric.id)}
                                                        className="action-button"
                                                        disabled={updatingAssignmentId !== null}
                                                    >
                                                        {updatingAssignmentId === rubric.id ? "Unassigning..." : "Unassign"}
                                                    </button>
                                                ) : rubric.assignedToJournal ? (
                                                    <span>Assigned</span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleAssign(rubric.id)}
                                                        className="action-button"
                                                        disabled={updatingAssignmentId !== null}
                                                    >
                                                        {updatingAssignmentId === rubric.id ? "Assigning..." : "Assign"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {rubricsLoading && <p>Loading rubrics...</p>}
                            {!rubricsLoading && !rubricsError && rubrics.length === 0 && (
                                <p className="no-rubrics-message">
                                    {view === "assigned"
                                        ? "No published rubrics have been assigned to this journal."
                                        : "No published rubrics to display."}
                                </p>
                            )}
                        </section>
                    </>
                )}
            </section>
        </main>
    );
}

export default JournalDashboard;