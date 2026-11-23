import CreateRubric from "../components/CreateRubric";
import RubricsTable, { type RubricsTableRef } from "../components/RubricsTable";
import { useRef } from "react";
import LogoutButton from "../components/LogoutButton";
import "../App.css";


function YourRubrics() {
    const tableRef = useRef<RubricsTableRef>(null);


    return (
        <main className="your-rubrics">
            <header className="rubrics-header">
                <h1>Your Rubrics</h1>
                <LogoutButton/>
            </header>
        
            <CreateRubric
                onRubricCreated={() => tableRef.current?.refresh()}
            />

            <RubricsTable ref={tableRef}/>
        </main>
    )};

export default YourRubrics;