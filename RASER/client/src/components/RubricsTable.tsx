import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Ref } from "react";
import api from "../api/axios";

interface Rubric {
    id: number;
    title: string;
    publishDate: string | null;
}

type RubricView = "all" | "published";

export interface RubricsTableRef {
    refresh: () => Promise<void>;
}

interface RubricsTableProps {
    ref?: Ref<RubricsTableRef>; // React 19
}

function RubricsTable({ ref }: RubricsTableProps) {
    const [rubrics, setRubrics] = useState<Rubric[]>([]);
    const [view, setView] = useState<RubricView>("all");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [publishingId, setPublishingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Prevent an older response from overwriting a newer view or refresh.
    const requestId = useRef(0);

    const fetchRubrics = useCallback(async (selectedView: RubricView) => {
        const endpoint = selectedView === "all"
            ? "/rubrics/all"
            : "/rubrics/list";
    
        console.log("Axios base URL:", api.defaults.baseURL);
        console.log("Request URL:", api.getUri({ url: endpoint }));
    
        setLoading(true);
    
        try {
            const response = await api.get<Rubric[]>(endpoint);
    
            console.log("HTTP Status:", response.status);
            console.log("Received rubrics:", response.data);
    
            setRubrics(response.data);
            setError(null);
        } catch (error) {
            console.error("Failed to fetch rubrics:", error);
            setError("Failed to retrieve rubrics.");
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshRubrics = useCallback(() => fetchRubrics(view), [fetchRubrics, view]);

    // YourRubrics.tsx calls tableRef.current?.refresh() after a successful POST.
    useImperativeHandle(ref, () => ({ refresh: refreshRubrics }), [refreshRubrics]);

    // Fetch on mount and whenever the selected tab changes.
    useEffect(() => {
        void fetchRubrics(view);
        return () => { requestId.current += 1; };
    }, [view, fetchRubrics]);

    const handlePublish = async (id: number) => {
        setPublishingId(id);
        setError(null);
        try {
            await api.patch(`/rubrics/publish/${id}`);
            await refreshRubrics();
        } catch (err) {
            console.error(`Failed PATCH /rubrics/publish/${id}:`, err);
            setError("Could not publish the rubric. Check the PATCH endpoint.");
        } finally {
            setPublishingId(null);
        }
    };

    const handleDelete = async (id: number, title: string) => {
        const confirmation = window.confirm(`Delete rubric ${title}? Action cannot be undone.`);

        if (!confirmation) return;

        setDeletingId(id);
        setError(null);

        try {
            await api.delete(`/rubrics/delete/${id}`);
            await refreshRubrics();
        } catch (err) {
            console.error(`Failed DELETE /rubrics/delete/${id}:`, err);
            setError(`Failed to delete rubric ${title}.`);
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <section className="rubrics-list-section">
            <div className="rubrics-table-controls">
                <div className="rubrics-view-slider" role="group" aria-label="Rubric view">
                    <button
                        type="button"
                        className={view === "all" ? "active" : ""}
                        aria-pressed={view === "all"}
                        onClick={() => setView("all")}
                    >
                        All Rubrics
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
                    disabled={loading}
                >
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {error && <p className="error-message" role="alert">{error}</p>}

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
                            <td>{rubric.publishDate ? "Published" : "Draft"}</td>
                            <td>
                                {!rubric.publishDate && (
                                    <button
                                        type="button"
                                        onClick={() => void handlePublish(rubric.id)}
                                        disabled={publishingId !== null}
                                        className="action-button"
                                    >
                                        {publishingId === rubric.id ? "Publishing..." : "Publish"}
                                    </button>
                                )}

                                {!rubric.publishDate && (
                                    <button
                                        type="button"
                                        onClick={() => void handleDelete(rubric.id, rubric.title)}
                                        disabled={deletingId !== null}
                                        className="action-button"
                                    >
                                        {deletingId === rubric.id ? "Deleting..." : "Delete"}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {loading && <p>Loading rubrics...</p>}
            {!loading && !error && rubrics.length === 0 && (
                <p className="no-rubrics-message">{view === "all"
                    ? "Nothing to display. Create a rubric to get started."
                    : "No published rubrics to display."}</p>
            )}
        </section>
    );
}

export default RubricsTable;
