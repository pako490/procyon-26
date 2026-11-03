
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import DesignerLogin from "./pages/DesignerLogin";
import YourRubrics from "./pages/YourRubrics";
import EditRubric from "./components/EditRubric";
import ProtectedRoute from "./components/ProtectedRoute";

import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const { isLoading, error } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Authentication Error: {error.message}</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/designer-login" element={<DesignerLogin />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/your-rubrics" element={<YourRubrics />} />
          <Route
            path="/your-rubrics/:rubricId/edit"
            element={<EditRubric />}
          />
        </Route>

        {/*Default Routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
