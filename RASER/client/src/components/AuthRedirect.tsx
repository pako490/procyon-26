
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";

function AuthRedirect() {
    const {
        role,
        isAuthenticated,
        isLoading,
        error,
    } = useCurrentUser();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    //now it directs to the striaght to the "your" pages instead of back to login, thanks Christine for catching that 
    switch (role) {
        case "DESIGNER":
        return <Navigate to="/your-rubrics" replace />;

        case "EDITOR":
        return <Navigate to="/your-journals" replace />;

        case "REVIEWER":
        return <div>Reviewer dashboard not implemented yet.</div>;

        default:
        return <div>User role not found.</div>;
    }
}

export default AuthRedirect;
