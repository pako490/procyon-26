
import { Route, Routes, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import DesignerLogin from "./pages/DesignerLogin";
import YourRubrics from "./pages/YourRubrics";
import EditRubric from "./components/EditRubric";
// import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import EditorLogin from "./pages/EditorLogin";
import YourJournals from "./pages/YourJournals";
import JournalDashboard from "./components/JournalDashboard";import ViewRubric from "./components/ViewRubric";

import AuthRedirect from "./components/AuthRedirect";
// import { useAuth0 } from "@auth0/auth0-react";

function App() {
  return (
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/designer-login" element={<DesignerLogin />} />
        <Route path="/editor-login" element={<EditorLogin />} />

        {/* Redirect users to their respective dashboard after login */}
        <Route path="/auth-redirect" element={<AuthRedirect />} />

        {/* Designer Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["DESIGNER"]} />}>
          <Route path="/your-rubrics" element={<YourRubrics />} />
          <Route path="/your-rubrics/:rubricId/edit" element={<EditRubric />} />
          <Route path="/your-rubrics/:rubricId/view" element={<ViewRubric />} />
        </Route>

        {/* Editor Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["EDITOR"]} />}>
          <Route path="/your-journals" element={<YourJournals />} />
          <Route
            path="/your-journals/:journalId/dashboard"
            element={<JournalDashboard />}
          />
        </Route>

        {/* Default Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

export default App;
