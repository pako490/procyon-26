import CreateRubric from "../components/CreateRubric";
import RubricsTable, { type RubricsTableRef } from "../components/RubricsTable";
import { useRef } from "react";
import "../App.css";


function YourRubrics() {
    const tableRef = useRef<RubricsTableRef>(null);


    return (
        <main className="your-rubrics">
            <header className="rubrics-header">
                <h1>Your Rubrics</h1>
            </header> 

            <CreateRubric
                onRubricCreated={() => tableRef.current?.refresh()}
            />
    
            <RubricsTable ref={tableRef}/> 
        </main>
    )};

export default YourRubrics;