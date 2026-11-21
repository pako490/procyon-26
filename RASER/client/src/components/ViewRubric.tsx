import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

interface RubricQuestion {
    id: number;
    question: string;
    criteria: string;
    rating1Description: string;
    rating2Description: string;
    rating3Description: string;
    rating4Description: string;
    rating5Description: string;
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

const rubricSectionHeadings = [
    "Introduction",
    "Materials and Sourcing",
    "Methodology and Reproducibility",
    "Replication, risk of bias and Statistics",
    "Reporting and Transparency",
];

// shows the dateTime in a more readable format
function formatPublishDate(value: string | null) {
    if (!value) return "Not published";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

function ViewRubric() {
    const { rubricId } = useParams();
    const navigate = useNavigate();
    const [rubric, setRubric] = useState<Rubric | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
   
    // load published rubric using its ID
    useEffect(() => {
        let isCurrent = true;
        const loadRubric = async () => {
            try {
                const response = await api.get<Rubric>(`/rubrics/view/${rubricId}`);
                if (!isCurrent) return;
                
                setRubric(response.data);
                setLoadError(null);
            } catch (error) {
                console.error("Failed to load rubric:", error);

                if (isCurrent) {
                    setLoadError("Failed to load rubric.");
                }
            } finally {
                if (isCurrent) {
                    setLoading(false);
                }
            }
        };

        void loadRubric();

        return () => {
            isCurrent = false;
        };
    }, [rubricId]);

     function returnToRubrics() {
        navigate("/your-rubrics");
    }

    if (loading) {
        return (
            <main className="your-rubrics view-rubric-page">Loading rubric...</main>
        );
    }

    if (!rubric) {
        return (
            <main className="your-rubrics view-rubric-page">
                <p className="error-message" role="alert">
                    {loadError ?? "Rubric not found."}
                </p>
                <button type="button" onClick={returnToRubrics}>
                    Return to Rubrics
                </button>
            </main>
        );
    }

    const sectionsByHeading = new Map(
        rubric.sections.map((section) => [section.heading, section]),
    );

    // computes max score by multiplying # of questions by 5
    const maxScore = rubric.sections.reduce(
        (total, section) => total + section.questions.length * 5,
        0,
    );

    return (
        <main className="your-rubrics view-rubric-page">
            <header className="view-rubric-header">
                <div className="view-rubric-title">
                    <h2>{rubric.title}</h2>
                    <p><strong>Publish Date:</strong> {formatPublishDate(rubric.publishDate)}</p>
                    <p><strong>URL:</strong> {rubric.sampleURL || "Implement URL here."}</p>
                </div>

                <button type="button" onClick={returnToRubrics}>
                    Return to Rubrics
                </button>
            </header>

            <table className="rubric-grid view-rubric-sections">
                <colgroup>
                    <col className="col-question" />
                    <col className="col-rating" span={5} />
                    <col className="col-criteria" />
                </colgroup>
                <thead>
                    <tr>
                        <th>Question</th>
                        <th colSpan={5}>Rating</th>
                        <th>Criteria</th>
                    </tr>
                </thead>
                <tbody>
                    {rubricSectionHeadings.map((heading, index) => {
                        const section = sectionsByHeading.get(heading);
                        return (
                            <Fragment key={heading}>
                                <tr className="rubric-section-heading">
                                    <th colSpan={7}>Section {index + 1}: {heading}</th>
                                </tr>
                                {section?.questions.map((question) => (
                                    <tr key={question.id}>
                                        <td>{question.question}</td>
                                        <td>5</td>
                                        <td>4</td>
                                        <td>3</td>
                                        <td>2</td>
                                        <td>1</td>
                                        <td>{question.criteria}</td>
                                    </tr>
                                ))}
                                
                                {section?.questions.length === 0 && (
                                    <tr>
                                        <td colSpan={7}>No questions in this section.</td>
                                    </tr>
                                )}  
                            </Fragment>
                        );
                    })}
                    <tr className="view-rubric-max-score">
                        <td>Maximum Possible Score</td>
                        <td colSpan={5}>{maxScore}</td>
                        <td>
                            {rubric.highQualThreshold !== null && rubric.lowQualThreshold !== null ? (
                                <div className="view-rubric-thresholds-list">
                                    <span>&ge; {rubric.highQualThreshold} = High Quality</span>
                                    <span>{rubric.lowQualThreshold} to {rubric.highQualThreshold} = Moderate</span>
                                    <span>&lt; {rubric.lowQualThreshold} = Low</span>
                                </div>
                            ) : (
                                "Thresholds not set"
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
        </main>
    );
}

export default ViewRubric;
