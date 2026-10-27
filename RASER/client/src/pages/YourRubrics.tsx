import CreateRubric from "../components/CreateRubric";
import "../App.css";

function YourRubrics() {
    return (
        <main className="your-rubrics">
            <header className="rubrics-header">
                <h1>Your Rubrics</h1>
            </header> 

            <CreateRubric />
    
            <section className="rubrics-list-section">
                <table className="rubrics-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {/* list rubrics here */}
                    </tbody>
                </table>

                <br/>
                <p>Nothing to display. Create a rubric to get started.</p>
            </section>
        </main>
    )
}

export default YourRubrics;