import { Fragment, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import AddQuestionModal from "./AddQuestionModal";

interface RubricQuestion {
    id: number;
    question: string;
    criteria: string;
}

interface RubricSection {
    id: number;
    heading: string;
    questions: RubricQuestion[];
}

interface Rubric {
    id: number;
    title: string;
    lowQualThreshold: number | null;
    highQualThreshold: number | null;
    sampleURL: string | null;
    publishDate: string | null;
    sections: RubricSection[];
}

type editable = "title" | "lowQualThreshold" | "highQualThreshold";

const rubricSectionHeadings = [
    "Introduction",
    "Materials and Sourcing",
    "Methodology and Reproducibility",
    "Replication, risk of bias and Statistics",
    "Reporting and Transparency",
];

function EditRubric() {
    const { rubricId } = useParams();
    const navigate = useNavigate();
    const [rubric, setRubric] = useState<Rubric | null>(null);
    const [title, setTitle] = useState("");
    const [lowQualThreshold, setLowQualThreshold] = useState("");
    const [highQualThreshold, setHighQualThreshold] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    
    // section the Add Question popup is open for, null when closed
    const [addingToSection, setAddingToSection] = useState<{ id: number; heading: string } | null>(null);
    const [saveMessage, setSaveMessage] = useState("");
    const saving = useRef<Promise<void>>(Promise.resolve());

    // loads up the current rubric's info based on id
    useEffect(() => {
        // flag that looking at same rubric
        let isCurrent = true;
        const loadRubric = async () => {
            try {
                const response = await api.get<Rubric>(`/rubrics/${rubricId}`);
                if (!isCurrent) return;
                setRubric(response.data);
                setTitle(response.data.title);
                setLowQualThreshold(response.data.lowQualThreshold?.toString() ?? "");
                setHighQualThreshold(response.data.highQualThreshold?.toString() ?? "");
            } catch (error) {
                console.error("Failed to load rubric:", error);
                if (isCurrent) setLoadError("Failed to load this rubric.");
            } finally {
                if (isCurrent) setLoading(false);
            }
        };

        void loadRubric();
        // cleanup if we switch to diff rubric
        return () => {
            isCurrent = false;
        };
    }, [rubricId]);

    // validations for editing title and thresholds
    function saveField(field: editable, value: string) {
        const patchValue = field === "title"
            ? value.trim()
            : value === "" ? null : Number(value);

        if (
            (field === "title" && patchValue === "") ||
            (field !== "title" &&
                patchValue !== null &&
                !Number.isInteger(patchValue))
        ) {
            setSaveMessage(field === "title"
                ? "Title cannot be empty."
                : "Thresholds must be whole numbers.");
            return;
        }

        // edits applied in order
        saving.current = saving.current.then(async () => {
            setSaveMessage("Saving...");
            try {
                await api.post(`/rubrics/edit/${rubricId}`, { [field]: patchValue });
                setSaveMessage("Changes saved.");
            } catch (error) {
                console.error(`Failed to update rubric ${field}:`, error);
                setSaveMessage("Could not save this change. Try again.");
            }
        });
    }

    // return to list of rubrics
    async function returnToRubrics() {
        await saving.current;
        navigate("/your-rubrics");
    }

    // if loading (still waiting on API request), display message
    if (loading) {
        return <main className="your-rubrics edit-rubric-page">Loading rubric...</main>;
    }

    // API request finished, and we either have rubric or we don't. If we don't, display load error
    if (!rubric) {
        return (
            <main className="your-rubrics edit-rubric-page">
                <p className="error-message" role="alert">
                    {loadError ?? "Rubric not found."}
                </p>
                <button type="button" onClick={() => void returnToRubrics()}>
                    Return to Rubrics
                </button>
            </main>
        );
    }

    const sectionsByHeading = new Map(
        rubric.sections.map((section) => [section.heading, section]),
    );

    return (
        <main className="your-rubrics edit-rubric-page">
            <header className="edit-rubric-header">
                <div className="edit-rubric-title">
                    <label htmlFor="rubric-title">Rubric Name:</label>
                    <input
                        id="rubric-title"
                        type="text"
                        value={title}
                        disabled={Boolean(rubric.publishDate)}
                        onChange={(event) => {
                            setTitle(event.target.value);
                        }}
                        onBlur={(event) => saveField("title", event.target.value)}
                    />
                    <p><strong>Status:</strong> {rubric.publishDate ? "Published" : "Draft"}</p>
                    <p><strong>URL:</strong> {rubric.sampleURL || "Implement URL here."}</p>
                </div>
                <div className="edit-rubric-thresholds">
                    <label htmlFor="low-threshold">Low Quality Threshold:</label>
                    <input
                        id="low-threshold"
                        type="text"
                        value={lowQualThreshold}
                        disabled={Boolean(rubric.publishDate)}
                        onChange={(event) => {
                            setLowQualThreshold(event.target.value);
                        }}
                        onBlur={(event) => saveField("lowQualThreshold", event.target.value)}
                    />
                    <label htmlFor="high-threshold">High Quality Threshold:</label>
                    <input
                        id="high-threshold"
                        type="text"
                        value={highQualThreshold}
                        disabled={Boolean(rubric.publishDate)}
                        onChange={(event) => {
                            setHighQualThreshold(event.target.value);
                        }}
                        onBlur={(event) => saveField("highQualThreshold", event.target.value)}
                    />
                </div>
                <button type="button" onClick={() => void returnToRubrics()}>
                    Return to Rubrics
                </button>
            </header>

            <p className="save-status">
                {saveMessage}
            </p>

            <table className="rubrics-table edit-rubric-sections">
                <thead>
                    <tr>
                        <th>Question</th>
                        <th>Criteria</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rubricSectionHeadings.map((heading, index) => {
                        const section = sectionsByHeading.get(heading);
                        return (
                            <Fragment key={heading}>
                                <tr className="edit-rubric-section-heading">
                                    <th colSpan={3}>Section {index + 1}: {heading}</th>
                                </tr>
                                {section?.questions.map((question) => (
                                    <tr key={question.id}>
                                        <td>{question.question}</td>
                                        <td>{question.criteria}</td>
                                        <td>
                                            <button type="button" disabled={Boolean(rubric.publishDate)}>
                                                Edit (implement)
                                            </button>
                                            <button type="button" disabled={Boolean(rubric.publishDate)}>
                                                Delete (implement)
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                <tr className="edit-rubric-add-question">
                                    <td colSpan={3}>
                                        <button
                                            type="button"
                                            disabled={Boolean(rubric.publishDate) || !section}
                                            onClick={() => {
                                                if (section) {
                                                    setAddingToSection({ id: section.id, heading });
                                                }
                                            }}
                                        >
                                            Add Question
                                        </button>
                                    </td>
                                </tr>
                            </Fragment>
                        );
                    })}
                </tbody>
            </table>

            {addingToSection && (
                <AddQuestionModal
                    sectionId={addingToSection.id}
                    sectionHeading={addingToSection.heading}
                    onSaved={(newQuestion) => {
                        // show the new row right away, no refetch needed
                        setRubric((current) => current && {
                            ...current,
                            sections: current.sections.map((section) =>
                                section.id === addingToSection.id
                                    ? { ...section, questions: [...section.questions, newQuestion] }
                                    : section,
                            ),
                        });
                    }}
                    onClose={() => setAddingToSection(null)}
                />
            )}
        </main>
    );
}

export default EditRubric;
