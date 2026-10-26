
import { useEffect, useState } from "react";
import api from "./api/axios";
import CreateRubric from "./components/CreateRubric";

interface User {
  id: number;
  name: string;
  email: string;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // Fetch users from Express
  const fetchUsers = async () => {
    try {
      const response = await api.get<User[]>("/users");
      setUsers(response.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve users.");
    }
  };

  // Fetch users when component mounts
  useEffect(() => {
    void fetchUsers();
  }, []);

  // Create a new user
  const addUser = async () => {
    if (!name.trim() || !email.trim()) return;

    try {
      await api.post("/users", {
        name,
        email,
      });

      setName("");
      setEmail("");
      await fetchUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to create user.");
    }
  };

  return (
    <>
      <div>
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
      </div>

      <CreateRubric />
    </>
  );
}

export default App;
