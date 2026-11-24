// import { useState } from "react";
// import type { FormEvent } from "react";

// // NOTE FOR WHOEVER'S DOING ASSIGN REVIEWER:
// // The ReviewAssignment table currently only links a paper to a reviewer (User). Deadline and
// // complete do not exist in the schema yet, so they will need to be added (and returned by the API,
// // along with the reviewer's name and email) before this table can show real data.
// export interface ReviewerAssignment {
//     id: number;
//     reviewerName: string;
//     reviewerEmail: string;
//     deadline: string | null;
//     complete: boolean;
// }

// export interface AssignReviewerInput {
//     email: string;
//     deadline: string; // yyyy-mm-dd
// }

// interface ReviewerPanelProps {
//     reviewers: ReviewerAssignment[];
    
//     // When provided, the form works. Throw (reject) to show an error.
//     // When omitted, the form is shown disabled.
//     onAssign?: (input: AssignReviewerInput) => Promise<void>;
    
//     // Opens a completed review. The View button is disabled until this is provided.
//     onViewReview?: (assignment: ReviewerAssignment) => void;
// }

// function formatDeadline(deadline: string | null) {
//     if (!deadline) return "—";
//     return new Date(deadline).toLocaleDateString(undefined, { dateStyle: "short", timeStyle: "short" });
// }

// function ReviewerPanel({ reviewers, onAssign, onViewReview }: ReviewerPanelProps) {
//     // const [assigning, setAssigning] = useState(false);
//     // const [error, setError] = useState("");

//     // const canAssign = onAssign !== undefined;

//     // async function handleSubmit(event: FormEvent<HTMLFormElement>) {
//     //     event.preventDefault();
//     //     if (!onAssign) return;

//     //     const form = event.currentTarget;
//     //     const formData = new FormData(form);
//     //     const email = String(formData.get("reviewer-email") ?? "").trim();
//     //     const deadline = String(formData.get("reviewer-deadline") ?? "");

//     //     if (!email || !deadline) {
//     //         setError("Enter a reviewer email and a deadline.");
//     //         return;
//     //     }

//     //     // setAssigning(true);
//     //     setError("");
//     //     try {
//     //         await onAssign({ email, deadline });
//     //         form.reset();
//     //     } catch (error) {
//     //         console.error("Failed to assign reviewer:", error);
//     //         setError("Could not assign this reviewer. Try again.");
//     //     } finally {
//     //         // setAssigning(false);
//     //         console.log("Reviewer assignment attempt finished.");
//     //     }
//     // }

//     return (
//         <section className="reviewer-panel" aria-label="Reviewers">
//             <h3>Reviewers (TO DO)</h3>
//             <p className="modal-hint">Assigning reviewers in next iteration.</p>

//             <table className="reviewer-table">
//                 <thead>
//                     <tr>
//                         <th scope="col">Assigned Reviewer</th>
//                         <th scope="col">Deadline</th>
//                         <th scope="col">Complete</th>
//                         <th scope="col">Review</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {reviewers.map((reviewer) => (
//                         <tr key={reviewer.id}>
//                             <td>{reviewer.reviewerName}</td>
//                             <td>{formatDeadline(reviewer.deadline)}</td>
//                             <td>{reviewer.complete ? "True" : "False"}</td>
//                             <td>
//                                 {reviewer.complete ? (
//                                     <button
//                                         type="button"
//                                         disabled={!onViewReview}
//                                         onClick={() => onViewReview?.(reviewer)}
//                                     >
//                                         View
//                                     </button>
//                                 ) : (
//                                     "—"
//                                 )}
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//             {reviewers.length === 0 && (
//                 <p className="modal-hint reviewer-empty">Nothing to display. Assign a reviewer to get started.</p>
//             )}
//         </section>
//     );
// }

// export default ReviewerPanel;