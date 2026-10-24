# PERN Stack Application

A full-stack application built with **PostgreSQL, Express, React, and Node.js (PERN)**, using **Prisma** to access the database and **Axios** for frontend API requests.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Axios
- **Backend:** Node.js, Express, TypeScript, Prisma
- **Database:** PostgreSQL

## Prerequisites

Install the following before getting started:

- [Node.js](https://nodejs.org/) and npm (use a current Node.js LTS release compatible with the project's Prisma version)
- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or another working Docker engine) to run PostgreSQL locally

## 1. Clone the Repository

```bash
git clone <REPOSITORY_URL>
cd <REPOSITORY_FOLDER>
```

The project is organized as follows:

```text
<REPOSITORY_FOLDER>/
├── client/            # React + Vite frontend
└── server/            # Express + Prisma backend
    ├── prisma/
    │   └── schema.prisma
    └── src/
```

## 2. Install Dependencies

From the repository root:

```bash
cd server
npm install
cd ../client
npm install
cd ..
```

> Both `client` and `server` have their own `package.json` files.

## 3. Start PostgreSQL

The following command starts a PostgreSQL 17 container for local development:

```bash
docker run --name pern-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pern_db \
  -p 127.0.0.1:5432:5432 \
  -v pern-postgres-data:/var/lib/postgresql/data \
  -d postgres:17
```

If you've created this container before, start it instead:

```bash
docker start pern-postgres
```

> The username and password above are **development-only examples**. Do not use them for a public database. If port 5432 is already occupied, change the port mapping and update `DATABASE_URL` below.

## 4. Configure Environment Variables

Create a file named `server/.env`:

```dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pern_db?schema=public"
PORT=5001
FRONTEND_URL=http://localhost:5173
```

Create a file named `client/.env`:

```dotenv
VITE_API_URL=http://localhost:5001/api
```

The React frontend uses `VITE_API_URL` to communicate with Express through Axios. The backend uses `DATABASE_URL` to connect Prisma to PostgreSQL.

**Never commit `.env` files or credentials to Git.** Only variables prefixed with `VITE_` are exposed to client-side code, so never put secrets in them.

## 5. Set Up the Database

From the `server` directory:

```bash
cd server
npx prisma generate
npx prisma migrate deploy
```

This generates the Prisma Client and applies committed migrations to your local PostgreSQL database. If your repository does not yet contain a `server/prisma/migrations` folder, the project maintainer needs to create and commit an initial migration (for example, with `npx prisma migrate dev --name init`).

Optional: explore database records with Prisma Studio:

```bash
npx prisma studio
```

## 6. Run the Application

Open two terminals from the repository root.

**Terminal 1 — Backend**

```bash
cd server
npm run dev
```

Expected API URL: `http://localhost:5001`.

**Terminal 2 — Frontend**

```bash
cd client
npm run dev
```

Open the URL displayed by Vite, typically `http://localhost:5173`.

To check the backend directly, visit:

```text
http://localhost:5001/api/users
```

If your database is empty and the example `/api/users` route is present, the endpoint should return `[]`.

## 7. Common Problems

| Problem | What to check |
| --- | --- |
| `403 Forbidden` on `localhost:5000` | On some Macs, AirPlay Receiver may use port 5000. Use port **5001** for Express instead. |
| `ECONNREFUSED` or database connection failed | Make sure the PostgreSQL container is running and that `DATABASE_URL` matches its port and credentials. |
| Prisma Client import / generation error | Run `npx prisma generate` from `server/`. |
| CORS error in browser | Confirm Express allows `http://localhost:5173` and that Vite is using the expected port. |
| Frontend network error | Confirm Express is running at `http://localhost:5001` and `client/.env` uses that address. Restart Vite after updating `.env`. |
| `npm run dev` fails | Confirm dependencies were installed in the correct directory and that the `dev` scripts exist in both `package.json` files. |

## Development Notes

- Make Prisma schema changes in `server/prisma/schema.prisma`.
- During development, create new migrations with `npx prisma migrate dev --name <migration_name>` from `server/`.
- Commit the resulting migration files so other contributors can apply them.
- Keep database credentials and other secrets out of source control.
- AWS deployment is not required for local development.

## Suggested `.gitignore` Entries

Ensure the repository ignores at least the following:

```gitignore
**/node_modules/
**/dist/
**/.env
**/.env.*
!**/.env.example
.DS_Store
```

If your Prisma generated client is built from the schema during setup, it can also be gitignored (for the layout in this README, `server/generated/`).
