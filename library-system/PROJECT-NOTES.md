# LibrarySys project notes

## Scope

A shared library workspace for a college library desk. Registered users can manage the same collection. Accounts represent library staff; borrowers are recorded by name and student/member ID. A student portal, staff approval/roles, fines, reservations, email notices, and the mobile client are outside this first web implementation.

The original React project supplied the name and initial dashboard, inventory, add-book, and checkout/return flows. This version extends that foundation with a MERN backend and the features missing from the project guidelines.

## Requirements mapping

Based on PROJECT/Project ADVWEBDEV.pdf supplied in the Advanced Web Programming folder.

| Guideline                 | Implementation                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| React, routing, hooks     | Functional page components; React Router; useState/useEffect; reusable useApi hook                              |
| Axios integration         | src/api.js, authenticated requests and API errors                                                               |
| Bootstrap or MUI          | Bootstrap styling and React Bootstrap dialogs                                                                   |
| Node + Express + MongoDB  | server/index.js, server/app.js, Mongoose User and Book models                                                   |
| Register/login/logout     | Auth pages; bcrypt password hashing; eight-hour JWT; revocation on logout                                       |
| Protected routes/API      | UI session restoration and server authenticate middleware                                                       |
| Dashboard/profile         | Overview statistics, recent additions, active loans, editable account profile                                   |
| Create/read/update/delete | Inventory, AddBook form, edit form, confirmed delete of unused copies                                           |
| Validation/security       | Server field allowlists, lengths, ISBN check digits, email/password/date validation, Helmet, auth rate limiting |
| Responsive navigation     | Desktop sidebar, compact horizontal mobile navigation, profile/sign-out                                         |
| Search/pagination         | Inventory and loan-history search and eight-record pages                                                        |
| Library features          | One record per physical copy; checkout, due dates, return history, overdue tracking                             |

## How the code fits the lessons

Lessons 1–3: JSX, functional components, props, CSS, reusable components. Lesson 4: form/button events and state. Lesson 5: layout, tables, pagination, React Bootstrap. Lesson 6: controlled forms, browser validation and server validation. Lesson 7: useState, useEffect, and a custom hook for fetching data.

No Redux, microservices, or complex state framework is needed. Loans are embedded in each copy so checkout and return use a single database update; two simultaneous checkout requests cannot both succeed. Deleting a copy with loan history is blocked to preserve records. Inventory deletion is available for unused copies.

## Mobile integration later

The Express API is independent of the React interface. A mobile app can call the same endpoints and send `Authorization: Bearer <token>`. Configure the server address for the phone's network; do not use the phone's own localhost. The normal server accepts connections on the configured port. The temporary demo binds only to this computer.

## Remaining submission work

The course also requires Chapter 1 documentation (context, purpose, objectives, scope, flowchart), a PDF, source/system screenshots, complete source, and presentation. These academic submission artifacts have not been produced in this web implementation. Confirm your group information and final system scope before drafting them.

## Validation

- ESLint and production build.
- Seven integration tests using an actual temporary MongoDB instance: auth protection, hashing, duplicate registration, CRUD/validation, database reads after app recreation, search/pagination, concurrent checkout, overdue/return history, profile, logout revocation.
- Local browser verification of the main workflows and responsive layout. Persistent Atlas/local-disk deployment is configured through .env but requires your own MongoDB connection; temporary test/demo data does not survive server shutdown.

## Technical references

- [React Bootstrap dialogs](https://react-bootstrap.github.io/docs/components/modal/)
- [Mongoose atomic updates](https://mongoosejs.com/docs/tutorials/findoneandupdate)
- [Express security guidance](https://expressjs.com/en/advanced/best-practice-security.html)
