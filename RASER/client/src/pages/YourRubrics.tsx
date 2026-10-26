import CreateRubric from "../components/CreateRubric";
import "../App.css";

function YourRubrics() {
    return (
        <main className="your-rubrics">
            <header className="your-rubrics-header">
                <h1>Your Rubrics</h1>
            </header>

            <section className="create-rubric-section">
                <CreateRubric />
            </section>
    
            <section className="rubrics-list-section">
                <p>Nothing to display. Create a rubric to get started.</p>
            </section>
        </main>
    )
}

export default YourRubrics;