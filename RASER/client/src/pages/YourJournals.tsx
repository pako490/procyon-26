
import { useRef } from "react";
import JournalTable, { type JournalTableRef } from "../components/JournalTable";
import RegisterJournal from "../components/RegisterJournal";
import "../App.css";

function YourJournals() {
    const tableRef = useRef<JournalTableRef>(null);

    return (
        <main className="editor-page">
            <section className="editor-card">
                <header className="editor-page-header">
                    <h1>Your Journals</h1>
                    <button type="button" className="secondary-button">
                        View All Published Rubrics
                    </button>
                </header>
                <RegisterJournal onJournalRegistered={() => tableRef.current?.refresh()} />
                <JournalTable ref={tableRef} />
            </section>
        </main>
    );
}

export default YourJournals;