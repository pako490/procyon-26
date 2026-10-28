
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import DesignerLogin from "./pages/DesignerLogin";
import YourRubrics from "./pages/YourRubrics";


function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/designer-login" element={<DesignerLogin />} />
          <Route path="/your-rubrics" element={<YourRubrics />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>

      {/* <div>
        <h1>User Management</h1>

        {error && <p role="alert">{error}</p>}

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={addUser}>Add User</button>

        <h2>Users</h2>

        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name} ({user.email})
            </li>
          ))}
        </ul>
      </div> */}

    </>
  );
}

export default App;
