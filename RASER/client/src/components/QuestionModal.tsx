import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import api from "../api/axios";

interface SavedQuestion {
    id: number;
    question: string;
    criteria: string;
    rating1Description: string;
    rating2Description: string;
    rating3Description: string;
    rating4Description: string;
    rating5Description: string;
}

interface QuestionModalProps {
    sectionId: number;
    sectionHeading: string;
    // when set, the popup edits this question instead of adding a new one
    existingQuestion?: SavedQuestion;
    onSaved: (question: SavedQuestion) => void;
    onClose: () => void;
}

// shown highest first, ratings state is stored lowest first (index 0 = rating 1)
const ratingLevels = [5, 4, 3, 2, 1];

function QuestionModal({ sectionId, sectionHeading, existingQuestion, onSaved, onClose }: QuestionModalProps) {
    const [question, setQuestion] = useState(existingQuestion?.question ?? "");
    const [ratings, setRatings] = useState<string[]>(
        existingQuestion
            ? [
                existingQuestion.rating1Description,
                existingQuestion.rating2Description,
                existingQuestion.rating3Description,
                existingQuestion.rating4Description,
                existingQuestion.rating5Description,
            ]
            : ["", "", "", "", ""],
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // escape closes the popup, unless a save is in flight
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape" && !saving) onClose();
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [saving, onClose]);

    function updateRating(level: number, value: string) {
        setRatings((current) => current.map((rating, index) => (index === level - 1 ? value : rating)));
    }

    // saves immediately: the question is added or updated as soon as the form is submitted
    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const trimmedQuestion = question.trim();
        const trimmedRatings = ratings.map((rating) => rating.trim());
        if (!trimmedQuestion || trimmedRatings.some((rating) => !rating)) {
            setError("Fill in the question and a description for every rating.");
            return;
        }

        setSaving(true);
        setError("");
        try {
            const response = existingQuestion
                ? await api.post<SavedQuestion>(`/question/edit/${existingQuestion.id}`, {
                    question: trimmedQuestion,
                    ratings: trimmedRatings,
                })
                : await api.post<SavedQuestion>("/question/add", {
                    sectionId,
                    question: trimmedQuestion,
                    ratings: trimmedRatings,
                });
            onSaved(response.data);
            onClose();
        } catch (saveError) {
            console.error("Failed to save question:", saveError);
            setError(`Could not ${existingQuestion ? "update" : "add"} this question. Try again.`);
            setSaving(false);
        }
    }

    return (
        <div
            className="modal-backdrop"
            onClick={() => {
                if (!saving) onClose();
            }}
        >
            <form
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="question-title"
                onClick={(event) => event.stopPropagation()}
                onSubmit={(event) => void handleSubmit(event)}
            >
                <h2 id="question-title">
                    {existingQuestion ? "Edit" : "Add"} Question: {sectionHeading}
                </h2>

                <label htmlFor="question-text">Question</label>
                <input
                    id="question-text"
                    type="text"
                    value={question}
                    autoFocus
                    placeholder="e.g. Is there a hypothesis?"
                    onChange={(event) => setQuestion(event.target.value)}
                />
                <p className="modal-hint">Fill out your criterion for each rating below.</p>

                {ratingLevels.map((level) => (
                    <div className="modal-rating" key={level}>
                        <label htmlFor={`question-rating-${level}`}>
                            Rating {level}
                            {level === 5 && " (highest)"}
                            {level === 1 && " (lowest)"}
                        </label>
                        <textarea
                            id={`question-rating-${level}`}
                            rows={2}
                            value={ratings[level - 1]}
                            onChange={(event) => updateRating(level, event.target.value)}
                        />
                    </div>
                ))}

                {error && (
                    <p className="error-message" role="alert">
                        {error}
                    </p>
                )}

                <div className="modal-actions">
                    <button type="button" disabled={saving} onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default QuestionModal;
