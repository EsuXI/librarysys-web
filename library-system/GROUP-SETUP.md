# LibrarySys setup for groupmates

Repository: https://github.com/EsuXI/librarysys-web (currently public).

## Where to put .env

Use the configured `.env` supplied separately by the project owner. It belongs inside `library-system`, in the same folder as `package.json`:

```text
librarysys-web/
  library-system/
    .env
    .env.example
    package.json
    src/
    server/
    api/
```

If someone sends you just the `.env` file, place it in that folder and keep the exact name `.env`, without `.txt` at the end. Do not put it inside `src` or `public`, or next to the outer repository folder.

## What the files are

- `library-system/.env`: ready-to-use application settings shared by the project owner. Includes MongoDB connection, local JWT secret, backend port, allowed local frontend origins, and an optional local DNS workaround.
- `library-system/.env.example`: template for someone using a different database. You do not need to rename or use it when the configured `.env` is already present.
- Outer `.env.local`: Vercel-generated authentication data. It is not pushed and groupmates do not need it.

The local JWT secret is separate from the production JWT secret in Vercel. The shared MongoDB connection points to the same database as the live website, so book edits, account edits, and borrowing changes are shared.

## Run the app

Install Node.js 22.12+ or Node 24. Clone/download the repository, then open a terminal at the repository root:

```powershell
cd library-system
npm.cmd ci
npm.cmd run server
```

Keep it open. In a second terminal in `library-system`:

```powershell
npm.cmd run dev
```

Open http://127.0.0.1:5173. Create your own LibrarySys account or use your existing one. The API runs at http://localhost:5000/api. No local MongoDB installation is needed because the app connects to Atlas.

Use `npm.cmd run server` for the shared database. `npm.cmd run demo` uses a separate temporary sample database and should not run at the same time on port 5000. Do not run `npm.cmd run seed` against the existing shared database.

The DNS setting applies only to the app's Node process. It does not change Windows network settings. If a port is already in use, stop the other app process before starting another copy.
