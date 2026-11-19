
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import api from "../api/axios";

type DatabaseUser = {
  id: number;
  email: string;
  name: string | null;
  role: string;
  auth0Id: string;
};

function Profile() {
  const {
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
  } = useAuth0();

  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.sub) return;

    let active = true;

    async function syncUser() {
      try {
        const token = await getAccessTokenSilently();
        const response = await api.post<DatabaseUser>(
          "/users/sync",
          undefined,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = response.data;

        if (active) {
          setDbUser(data);
          setError(data.role === "DESIGNER"
            ? null
            : "This RASER account does not have the Designer role.");
        }
      } catch (err) {
        if (active) {
          const message = axios.isAxiosError<{ error?: string }>(err)
            ? err.response?.data?.error
            : undefined;
          setError(message ?? (err instanceof Error
            ? err.message
            : "Could not synchronize your RASER account."));
        }
      }
    }

    syncUser();

    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.sub, getAccessTokenSilently]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Not logged in</div>;
  }

  return (
    <div>
      {/* <h2>Auth0 Profile</h2> */}
      <p>Email: {user?.email}</p>

      {/* <h2>Database User</h2> */}

      {error && <p>Error: {error}</p>}

      {/* If users/sync has succeeded: either
      1. that auth0Id is already stored in the db, we return that db user
      2. that auth0Id doesn't exist, but the (seeded) email used does, so we fill that column for the future, and return that db user
      Thus, user has been authorized and linked, so their further requests will be authorized */}
      {dbUser ? (
        <>
          {/* <p>ID: {dbUser.id}</p>
          <p>Name: {dbUser.name}</p>
          <p>Role: {dbUser.role}</p>
          <p>Auth0 ID: {dbUser.auth0Id}</p> */}
          {dbUser.role === "DESIGNER" && !error && (
            <Link to="/your-rubrics" className="login-button">
              Continue to Your Rubrics
            </Link>
          )}
        </>
      ) : (
        !error && <p>Synchronizing user...</p>
      )}
    </div>
  );
}

export default Profile;
