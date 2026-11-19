
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

export type UserRole = "DESIGNER" | "EDITOR" | "REVIEWER";

export type DatabaseUser = {
    id: number;
    email: string;
    name: string | null;
    role: UserRole;
    auth0Id: string;
};

export function useCurrentUser() {
    const {
        user,
        isAuthenticated,
        isLoading: authLoading,
        getAccessTokenSilently,
    } = useAuth0();

    const [dbUser, setDbUser] = useState<DatabaseUser | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        async function syncUser() {
        setDbUser(null);
        setError(null);

        // Wait until Auth0 finishes checking authentication
        if (authLoading) return;

        // No authenticated user
        if (!isAuthenticated || !user?.sub) {
            setLoadingUser(false);
            return;
        }

        setLoadingUser(true);

        try {
            // Retrieve Auth0 access token
            const token = await getAccessTokenSilently();

            // Synchronize Auth0 user with PostgreSQL
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
            throw new Error(`User sync failed: ${response.status}`);
            }

            const data: DatabaseUser = await response.json();

            if (active) {
            setDbUser(data);
            }
        } catch (err) {
            if (active) {
            setError(
                err instanceof Error ? err.message : "Failed to sync user"
            );
            }
        } finally {
            if (active) {
            setLoadingUser(false);
            }
        }
        }

        syncUser();

        return () => {
        active = false;
        };
    }, [
        isAuthenticated,
        authLoading,
        user?.sub,
        getAccessTokenSilently,
    ]);

    return {
        dbUser,
        role: dbUser?.role ?? null,
        isAuthenticated,
        isLoading: authLoading || loadingUser,
        error,
    };
}
