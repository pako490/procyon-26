
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

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

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/sync`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Sync failed: ${response.status}`);
        }

        const data: DatabaseUser = await response.json();

        if (active) {
          setDbUser(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unknown error"
          );
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
      <h2>Auth0 Profile</h2>
      <p>Email: {user?.email}</p>

      <h2>Database User</h2>

      {error && <p>Error: {error}</p>}

      {dbUser ? (
        <>
          <p>ID: {dbUser.id}</p>
          <p>Name: {dbUser.name}</p>
          <p>Role: {dbUser.role}</p>
          <p>Auth0 ID: {dbUser.auth0Id}</p>
        </>
      ) : (
        !error && <p>Synchronizing user...</p>
      )}
    </div>
  );
}

export default Profile;
