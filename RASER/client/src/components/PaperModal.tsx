import { useEffect, useState } from "react";
import axios from "axios";
import api from "../api/axios";
// import ReviewerPanel from "./ReviewerPanel";

export interface Paper {
    id: number;
    title: string;
    authors: string | null;
    status: "IN_REVIEW" | "WITHDRAWN";
    issueId: number;
    reviewerCount: number;
}

interface PaperModalProps {
    paper: Paper;
    onWithdrawn: (paper: Paper) => void;
    onClose: () => void;
}

function PaperModal({ paper, onWithdrawn, onClose }: PaperModalProps) {
    const [withdrawing, setWithdrawing] = useState(false);
    const [error, setError] = useState("");

    const hasReviewers = paper.reviewerCount > 0;

    // escape closes the popup, unless a withdraw is in flight
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape" && !withdrawing) onClose();
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [withdrawing, onClose]);

    async function handleWithdraw() {
        setWithdrawing(true);
        setError("");
        try {
            await api.post(`/papers/${paper.id}/withdraw`);
            onWithdrawn(paper);
            onClose();
        } catch (withdrawError) {
            console.error("Failed to withdraw paper:", withdrawError);
            // the server explains why (e.g. reviewers were assigned since this loaded)
            const serverMessage = axios.isAxiosError(withdrawError)
                ? withdrawError.response?.data?.error
                : undefined;
            setError(serverMessage ?? "Could not withdraw this paper. Try again.");
            setWithdrawing(false);
        }
    }

    return (
        <div
            className="modal-backdrop"
            onClick={() => {
                if (!withdrawing) onClose();
            }}
        >
            <div
                className="modal modal--wide"
                role="dialog"
                aria-modal="true"
                aria-labelledby="paper-title"
                onClick={(event) => event.stopPropagation()}
            >
                <h2 id="paper-title">{paper.title}</h2>
                {paper.authors && <p className="modal-hint">By {paper.authors}</p>}

                <p>
                    Status: <strong>{paper.status === "IN_REVIEW" ? "In review" : "Withdrawn"}</strong>
                </p>
                <p>Reviewers assigned: {paper.reviewerCount}</p>

                {/* TODO(assign reviewer): load this paper's reviewers from the API and pass them in,
                    and pass onAssign to enable the form. Refresh the paper afterwards so reviewerCount updates. */}
                {/* <ReviewerPanel reviewers={[]} /> */}

                {hasReviewers && (
                    <p className="modal-hint">
                        A paper can only be withdrawn before reviewers are assigned.
                    </p>
                )}

                {error && (
                    <p className="error-message" role="alert">
                        {error}
                    </p>
                )}

                <div className="modal-actions">
                    <button type="button" disabled={withdrawing} onClick={onClose}>
                        Close
                    </button>
                    <button
                        type="button"
                        disabled={withdrawing || hasReviewers}
                        onClick={() => void handleWithdraw()}
                    >
                        {withdrawing ? "Withdrawing..." : "Withdraw"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PaperModal;
