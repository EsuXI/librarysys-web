# LibrarySys

A college-level MERN Library Management System built from the group's React starter. React Router and hooks handle the interface; React Bootstrap supplies dialogs; Axios connects to an Express API; MongoDB stores users, books, and loan history.

## Quick sample preview

Use Node.js 22.12+ (Node 24 also works).

```powershell
cd "D:\CODING\ADV WEB\Finals\library-system"
npm.cmd ci
npm.cmd run demo
```

Keep that terminal open. In a second terminal, in the same folder:

```powershell
npm.cmd run dev
```

Open http://127.0.0.1:5173. Click **Fill demo credentials**, then **Sign in**.

- Email: `demo@librarysys.test`
- Password: `LibraryDemo2026!`

The sample preview starts a real temporary MongoDB process with 12 sample copies. The first run downloads the MongoDB binary from its official distribution service. This is for local practice and UI review: all demo changes disappear when its server stops. Stop it with Ctrl+C before using the persistent server, since both use port 5000.

## Persistent database setup

1. Install MongoDB Community locally, or create a MongoDB Atlas database and obtain its connection URI.
2. Copy the environment template:

```powershell
Copy-Item .env.example .env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

3. Open `.env`. Set `MONGODB_URI` to your connection URI and `JWT_SECRET` to the generated value. Do not share or commit this file.
4. Start the backend:

```powershell
npm.cmd run server
```

5. In another terminal run `npm.cmd run dev`, then create your account in the browser. The database starts empty. Add real books through the form.
6. Optional: before registering or adding any books, run `npm.cmd run seed` for sample data. It refuses to seed a nonempty library. The sample password is for practice only.

Books are stored in MongoDB, so refreshing the page or restarting the normal backend preserves them. The JWT is kept in sessionStorage for this browser tab, expires after eight hours, and is sent as a Bearer token. Logout revokes all previously issued tokens for that account.

## Everyday workflows

- **Overview:** collection totals, available/borrowed copies, overdue books, recent additions, current loans.
- **Inventory:** search title, author, ISBN or shelf; filter category/status; paginate; edit copy details.
- **Add a book:** title, author, valid ISBN, category and shelf. One record is one physical copy; multiple copies may share an ISBN.
- **Check out:** choose an available book; enter borrower name, student/member ID, and a due date.
- **Return:** confirm the return from inventory or borrowing page. The loan remains in history.
- **Delete:** unused copies can be deleted after confirmation. Copies with any loan history stay in the catalog to preserve records.
- **Profile:** update your name/email or sign out (also accessible on phones).

Accounts share one library and have equal management access. Borrowers do not need accounts in this version. A public student portal and separate staff roles have not been added.

## Folder guide

```text
src/
  App.jsx                  Session checks, protected workspace and routes
  api.js                   Axios client and authentication header
  hooks/useApi.js          Reusable data fetching with effect cleanup
  components/              Sidebar, UI helpers, checkout/return dialog
  pages/                   Overview, inventory, book form, loans, auth, profile
  App.css / index.css      Responsive custom design over Bootstrap
server/
  app.js                   Express REST routes and input validation
  auth.js                  JWT issuing and authentication middleware
  models.js                MongoDB User, Book and embedded Loan schemas
  validation.js            Field, ISBN and date checks
  index.js                 Persistent MongoDB server entry
  demo.js                  Temporary MongoDB sample preview
  sample-data.js / seed.js  Optional sample records
  tests/library.test.js    Integration tests
```

## Checks

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

Tests run against a separate temporary MongoDB instance, leaving your configured library database untouched. They check authentication, hashing, validation, CRUD, search/pagination, simultaneous checkout, return history, profile updates and token revocation.

## API for the future mobile app

Use `Authorization: Bearer <token>` for protected requests. Endpoint paths are relative to `http://<server-address>:5000/api`. Responses are JSON; failures return `{ message }` with an appropriate HTTP status. Dates use Asia/Manila for due-date boundaries.

| Method             | Endpoint            | Purpose                                           |
| ------------------ | ------------------- | ------------------------------------------------- |
| GET                | /health             | Database connection and sample-preview status     |
| POST               | /auth/register      | name, email, password; returns user and token     |
| POST               | /auth/login         | email, password; returns user and token           |
| GET                | /auth/me            | Current account                                   |
| PUT                | /auth/profile       | Update name and email                             |
| POST               | /auth/logout        | Revoke current account's sessions                 |
| GET                | /dashboard          | Collection statistics, recent books, active loans |
| GET                | /books              | search, category, status, page query parameters   |
| POST               | /books              | Create a copy                                     |
| GET / PUT / DELETE | /books/:id          | Read, update, delete a copy                       |
| POST               | /books/:id/checkout | borrower, borrowerId, dueDate                     |
| POST               | /books/:id/return   | Confirm return                                    |
| GET                | /loans              | search, status, page query parameters             |

The frontend uses Vite's `/api` proxy locally. On Vercel, `vercel.json` serves the built React interface and routes `/api/*` to `api/index.js`, which runs the same Express API. No separate API domain or `VITE_API_URL` is needed for this deployment.

## Vercel and GitHub

The repository contains the `library-system` subfolder. Set that as the Vercel project's **Root Directory**. Use the Vite preset, `npm run build`, and output directory `dist`.

In Vercel → Project → Settings → Environment Variables, configure:

- `JWT_SECRET`: a random secret of at least 32 characters, stored as Sensitive. This has been generated for the LibrarySys Vercel project.
- `MONGODB_URI`: your MongoDB Atlas connection string for a dedicated `librarysys` database. Store it as Sensitive in Production and Preview. Use Atlas network access rules that allow the deployed backend to connect.
- `CLIENT_ORIGIN` is only needed if another browser frontend calls this API from a different domain. The web app uses same-origin requests on Vercel.

After adding the database connection, redeploy from the latest GitHub commit. `/api/health` should report `database: connected`. Register your own account and add books. The temporary preview database and demo account are not uploaded to Vercel.

If the database is not configured, the deployed API returns HTTP 503 and the login page displays a setup-in-progress notice. This is intentional; online login, registration, and saved book records need a persistent database.

Connect this GitHub repository in Vercel's Git settings. Pushes to `main` then deploy production automatically; other branches produce previews. Secrets and `.vercel` account metadata are excluded from Git.

## Troubleshooting

- **Cannot reach server:** run the backend and confirm `http://127.0.0.1:5000/api/health` says connected.
- **MongoDB connection error:** check the service/Atlas URI, credentials, and Atlas network access settings.
- **JWT secret error:** replace the placeholder with a random value of at least 32 characters.
- **Port in use:** stop the other process using 5000/5173. Run only one backend at a time.
- **Invalid ISBN:** use a real ISBN-10/ISBN-13; its check digit is validated. Spaces/hyphens are accepted.
- **Seed refused:** sample seeding only works on an empty database; no existing data is overwritten.

Read PROJECT-NOTES.md for the requirement mapping, scope, lesson connections, and remaining academic submission artifacts.
