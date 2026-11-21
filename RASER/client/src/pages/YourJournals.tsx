
import { useRef } from "react";
import JournalTable, { type JournalTableRef } from "../components/JournalTable";
import RegisterJournal from "../components/RegisterJournal";
import LogoutButton from "../components/LogoutButton";
import "../App.css";

function YourJournals() {
    const tableRef = useRef<JournalTableRef>(null);

    return (
        <main className="editor-page">
            <section className="editor-card">
                <header className="editor-page-header">
                    <h1>Your Journals</h1>
                    <LogoutButton/>
                </header>
                
                <RegisterJournal onJournalRegistered={() => tableRef.current?.refresh()} />
                <JournalTable ref={tableRef} />
            </section>
        </main>
    );
}

export default YourJournals;