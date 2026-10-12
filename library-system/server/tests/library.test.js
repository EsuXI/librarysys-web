import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../app.js";
import { Book, User } from "../models.js";
import { today, validIsbn } from "../validation.js";

let mongo, app, token, userId, bookId;
const auth = () => ({ Authorization: `Bearer ${token}` });
const fields = {
  title: "The Pragmatic Programmer",
  author: "David Thomas",
  isbn: "978-0135957059",
  category: "Technology",
  shelf: "T-01",
};
before(async () => {
  process.env.JWT_SECRET = "test-secret-for-library-system-with-32-characters";
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await User.init();
  app = createApp();
});
after(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});

test("requires authentication and rejects a forged token", async () => {
  await request(app).get("/api/books").expect(401);
  const forged = jwt.sign(
    { sub: new mongoose.Types.ObjectId().toString(), version: 0 },
    "incorrect-secret",
  );
  await request(app)
    .get("/api/books")
    .set("Authorization", `Bearer ${forged}`)
    .expect(401);
});
test("registers, hashes passwords, rejects duplicate email and invalid registration", async () => {
  await request(app)
    .post("/api/auth/register")
    .send({ name: " ", email: "bad", password: "short" })
    .expect(400);
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Test Librarian",
      email: "librarian@example.com",
      password: "TestPassword123!",
    })
    .expect(201);
  token = response.body.token;
  userId = response.body.user.id;
  assert.equal(response.body.user.password, undefined);
  const user = await User.findById(userId).select("+password");
  assert.notEqual(user.password, "TestPassword123!");
  assert.ok(user.password.startsWith("$2"));
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Duplicate",
      email: "LIBRARIAN@example.com",
      password: "TestPassword123!",
    })
    .expect(409);
  await request(app)
    .post("/api/auth/login")
    .send({ email: "librarian@example.com", password: "WrongPassword!" })
    .expect(401);
  await request(app)
    .post("/api/auth/login")
    .send({ email: "librarian@example.com", password: "TestPassword123!" })
    .expect(200);
});
test("validates book fields and ignores client-supplied status", async () => {
  assert.equal(validIsbn("9780135957059"), true);
  assert.equal(validIsbn("9780135957058"), false);
  await request(app)
    .post("/api/books")
    .set(auth())
    .send({ ...fields, title: " " })
    .expect(400);
  await request(app)
    .post("/api/books")
    .set(auth())
    .send({ ...fields, isbn: "1234567890123" })
    .expect(400);
  const response = await request(app)
    .post("/api/books")
    .set(auth())
    .send({ ...fields, status: "Borrowed", loans: [{ borrower: "Injected" }] })
    .expect(201);
  bookId = response.body._id;
  assert.equal(response.body.status, "Available");
  assert.equal(response.body.loans.length, 0);
  assert.equal(response.body.isbn, "9780135957059");
});
test("supports books without ISBN and clearing an existing ISBN", async () => {
  for (const isbn of [undefined, null, "", "   "]) {
    const created = await request(app)
      .post("/api/books")
      .set(auth())
      .send({ ...fields, isbn })
      .expect(201);
    assert.equal(created.body.isbn, "");
    const id = created.body._id;
    const withIsbn = await request(app)
      .put(`/api/books/${id}`)
      .set(auth())
      .send(fields)
      .expect(200);
    assert.equal(withIsbn.body.isbn, "9780135957059");
    const cleared = await request(app)
      .put(`/api/books/${id}`)
      .set(auth())
      .send({ ...fields, isbn: "" })
      .expect(200);
    assert.equal(cleared.body.isbn, "");
    const read = await request(app)
      .get(`/api/books/${id}`)
      .set(auth())
      .expect(200);
    assert.equal(read.body.isbn, "");
    await request(app).delete(`/api/books/${id}`).set(auth()).expect(200);
  }
  for (const isbn of [123, {}, "N/A", "---", "9780135957058"]) {
    await request(app)
      .post("/api/books")
      .set(auth())
      .send({ ...fields, isbn })
      .expect(400);
  }
});
test("persists records across app recreation and supports update, search, pagination", async () => {
  const secondApp = createApp();
  const read = await request(secondApp)
    .get(`/api/books/${bookId}`)
    .set(auth())
    .expect(200);
  assert.equal(read.body.title, fields.title);
  await request(app)
    .put(`/api/books/${bookId}`)
    .set(auth())
    .send({ ...fields, shelf: "T-09" })
    .expect(200);
  await Book.insertMany(
    Array.from({ length: 9 }, (_, i) => ({
      ...fields,
      isbn: "9780135957059",
      title: `Reference ${i}`,
    })),
  );
  const first = await request(app).get("/api/books").set(auth()).expect(200);
  assert.equal(first.body.books.length, 8);
  assert.equal(first.body.pages, 2);
  const second = await request(app)
    .get("/api/books?page=2")
    .set(auth())
    .expect(200);
  assert.equal(second.body.books.length, 2);
  const search = await request(app)
    .get("/api/books?search=T-09")
    .set(auth())
    .expect(200);
  assert.equal(search.body.total, 1);
  const literalSearch = await request(app)
    .get("/api/books?search=%5B.*")
    .set(auth())
    .expect(200);
  assert.equal(literalSearch.body.total, 0);
  await request(app).get("/api/books/not-an-id").set(auth()).expect(400);
});
test("rejects empty borrowers and invalid dates, allows only one concurrent checkout", async () => {
  const payload = {
    borrower: "Student Reader",
    borrowerId: "2026-001",
    dueDate: today(),
  };
  await request(app)
    .post(`/api/books/${bookId}/checkout`)
    .set(auth())
    .send({ ...payload, borrower: " " })
    .expect(400);
  await request(app)
    .post(`/api/books/${bookId}/checkout`)
    .set(auth())
    .send({ ...payload, dueDate: "2026-02-30" })
    .expect(400);
  await request(app)
    .post(`/api/books/${bookId}/checkout`)
    .set(auth())
    .send({ ...payload, dueDate: "2000-01-01" })
    .expect(400);
  const attempts = await Promise.all(
    [1, 2].map(() =>
      request(app)
        .post(`/api/books/${bookId}/checkout`)
        .set(auth())
        .send(payload),
    ),
  );
  assert.deepEqual(
    attempts.map((response) => response.status).sort(),
    [200, 409],
  );
  const book = await Book.findById(bookId);
  assert.equal(book.loans.length, 1);
  assert.equal(book.status, "Borrowed");
  await request(app).delete(`/api/books/${bookId}`).set(auth()).expect(409);
});
test("records overdue loans, returns only once, preserves history", async () => {
  await Book.updateOne(
    { _id: bookId },
    { $set: { "loans.0.dueDate": "2000-01-01" } },
  );
  const dashboard = await request(app)
    .get("/api/dashboard")
    .set(auth())
    .expect(200);
  assert.equal(dashboard.body.overdue, 1);
  const overdue = await request(app)
    .get("/api/loans?status=Overdue&search=Student")
    .set(auth())
    .expect(200);
  assert.equal(overdue.body.total, 1);
  await request(app)
    .post(`/api/books/${bookId}/return`)
    .set(auth())
    .expect(200);
  await request(app)
    .post(`/api/books/${bookId}/return`)
    .set(auth())
    .expect(409);
  const history = await request(app)
    .get("/api/loans?status=Returned")
    .set(auth())
    .expect(200);
  assert.equal(history.body.total, 1);
  assert.ok(history.body.loans[0].returnedAt);
  await request(app).delete(`/api/books/${bookId}`).set(auth()).expect(409);
  const extra = await Book.findOne({ "loans.0": { $exists: false } });
  await request(app).delete(`/api/books/${extra.id}`).set(auth()).expect(200);
  await request(app).get(`/api/books/${extra.id}`).set(auth()).expect(404);
});
test("updates profile, prevents password leakage, revokes tokens on logout", async () => {
  const profile = await request(app)
    .put("/api/auth/profile")
    .set(auth())
    .send({
      name: "Updated Librarian",
      email: "updated@example.com",
      password: "ignored",
    })
    .expect(200);
  assert.equal(profile.body.name, "Updated Librarian");
  const me = await request(app).get("/api/auth/me").set(auth()).expect(200);
  assert.equal(me.body.password, undefined);
  await request(app).post("/api/auth/logout").set(auth()).expect(200);
  await request(app).get("/api/books").set(auth()).expect(401);
});
