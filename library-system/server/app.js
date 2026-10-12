import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User, Book } from "./models.js";
import { authenticate, publicUser, tokenFor } from "./auth.js";
import {
  bookFields,
  email,
  password,
  text,
  dueDate,
  fail,
  today,
} from "./validation.js";

export function createApp() {
  const app = express();
  if (process.env.VERCEL) app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  app.use(helmet());
  app.use(
    cors({
      origin: (
        process.env.CLIENT_ORIGIN ||
        "http://localhost:5173,http://127.0.0.1:5173"
      ).split(","),
    }),
  );
  app.use(express.json({ limit: "20kb" }));
  app.use((req, res, next) => {
    if (req.body === undefined) req.body = {};
    if (
      ["POST", "PUT"].includes(req.method) &&
      (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
    )
      return res
        .status(400)
        .json({ message: "Send a JSON object with the required fields." });
    next();
  });
  app.get("/api/health", (req, res) =>
    res.json({
      status: "ok",
      database:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      demo: process.env.DEMO_MODE === "true",
    }),
  );
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many attempts. Please try again in 15 minutes." },
  });
  app.post("/api/auth/register", authLimiter, async (req, res) => {
    const name = text(req.body.name, "Name", 80);
    const userEmail = email(req.body.email);
    const hash = await bcrypt.hash(password(req.body.password), 12);
    const user = await User.create({ name, email: userEmail, password: hash });
    res.status(201).json({ user: publicUser(user), token: tokenFor(user) });
  });
  app.post("/api/auth/login", authLimiter, async (req, res) => {
    const userEmail = email(req.body.email);
    const candidate = password(req.body.password);
    const user = await User.findOne({ email: userEmail }).select("+password");
    if (!user || !(await bcrypt.compare(candidate, user.password)))
      fail(401, "Email or password is incorrect.");
    res.json({ user: publicUser(user), token: tokenFor(user) });
  });
  app.use("/api", authenticate);
  app.get("/api/auth/me", (req, res) => res.json(publicUser(req.user)));
  app.post("/api/auth/logout", async (req, res) => {
    // Logout invalidates all previous tokens for this account, including mobile.
    await User.updateOne({ _id: req.user.id }, { $inc: { tokenVersion: 1 } });
    res.json({ message: "Signed out." });
  });
  app.put("/api/auth/profile", async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          name: text(req.body.name, "Name", 80),
          email: email(req.body.email),
        },
      },
      { new: true, runValidators: true },
    );
    res.json(publicUser(user));
  });
  app.param("id", (req, res, next, id) => {
    if (!mongoose.isObjectIdOrHexString(id))
      return next(
        Object.assign(new Error("Invalid book ID."), { status: 400 }),
      );
    next();
  });
  app.get("/api/dashboard", async (req, res) => {
    const [total, available, overdue, recent, activeLoans] = await Promise.all([
      Book.countDocuments(),
      Book.countDocuments({ status: "Available" }),
      Book.countDocuments({
        status: "Borrowed",
        loans: { $elemMatch: { returnedAt: null, dueDate: { $lt: today() } } },
      }),
      Book.find().sort({ createdAt: -1 }).limit(5),
      Book.find({ status: "Borrowed" }).sort({ "loans.dueDate": 1 }).limit(5),
    ]);
    res.json({
      total,
      available,
      borrowed: total - available,
      overdue,
      recent,
      activeLoans,
    });
  });
  app.get("/api/books", async (req, res) => {
    const filter = {};
    if (typeof req.query.search === "string" && req.query.search.trim()) {
      const search = req.query.search
        .slice(0, 160)
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = ["title", "author", "isbn", "shelf"].map((field) => ({
        [field]: { $regex: search, $options: "i" },
      }));
    }
    if (["Available", "Borrowed"].includes(req.query.status))
      filter.status = req.query.status;
    if (req.query.status === "Overdue") {
      filter.status = "Borrowed";
      filter.loans = {
        $elemMatch: { returnedAt: null, dueDate: { $lt: today() } },
      };
    }
    if (typeof req.query.category === "string" && req.query.category)
      filter.category = req.query.category;
    const page = Math.max(
      1,
      Math.min(100000, Number.parseInt(req.query.page) || 1),
    );
    const limit = 8;
    const total = await Book.countDocuments(filter);
    const pages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, pages);
    const books = await Book.find(filter)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * limit)
      .limit(limit);
    res.json({ books, total, page: currentPage, pages });
  });
  app.get("/api/books/:id", async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (!book) fail(404, "Book not found.");
    res.json(book);
  });
  app.post("/api/books", async (req, res) =>
    res.status(201).json(await Book.create(bookFields(req.body))),
  );
  app.put("/api/books/:id", async (req, res) => {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: bookFields(req.body) },
      { new: true, runValidators: true },
    );
    if (!book) fail(404, "Book not found.");
    res.json(book);
  });
  app.delete("/api/books/:id", async (req, res) => {
    const book = await Book.findOneAndDelete({
      _id: req.params.id,
      status: "Available",
      "loans.0": { $exists: false },
    });
    if (!book) {
      if (!(await Book.exists({ _id: req.params.id })))
        fail(404, "Book not found.");
      fail(
        409,
        "Copies with a loan history cannot be deleted. Keep them for your records.",
      );
    }
    res.json({ message: "Book deleted." });
  });
  app.post("/api/books/:id/checkout", async (req, res) => {
    const loan = {
      borrower: text(req.body.borrower, "Borrower name", 80),
      borrowerId: text(req.body.borrowerId, "Student / member ID", 40),
      dueDate: dueDate(req.body.dueDate),
      borrowedAt: new Date(),
      returnedAt: null,
    };
    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, status: "Available" },
      { $set: { status: "Borrowed" }, $push: { loans: loan } },
      { new: true, runValidators: true },
    );
    if (!book)
      fail(409, "This book is no longer available. Refresh your inventory.");
    res.json(book);
  });
  app.post("/api/books/:id/return", async (req, res) => {
    const book = await Book.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "Borrowed",
        loans: { $elemMatch: { returnedAt: null } },
      },
      { $set: { status: "Available", "loans.$.returnedAt": new Date() } },
      { new: true, runValidators: true },
    );
    if (!book)
      fail(409, "This book has already been returned or does not exist.");
    res.json(book);
  });
  app.get("/api/loans", async (req, res) => {
    const books = await Book.find({ "loans.0": { $exists: true } });
    let loans = books.flatMap((book) =>
      book.loans.map((loan) => ({
        ...loan.toObject(),
        bookId: book.id,
        title: book.title,
        author: book.author,
      })),
    );
    const search =
      typeof req.query.search === "string"
        ? req.query.search.toLowerCase().trim()
        : "";
    loans = loans.filter((loan) =>
      `${loan.title} ${loan.borrower} ${loan.borrowerId}`
        .toLowerCase()
        .includes(search),
    );
    if (req.query.status === "Active")
      loans = loans.filter((loan) => !loan.returnedAt);
    if (req.query.status === "Returned")
      loans = loans.filter((loan) => loan.returnedAt);
    if (req.query.status === "Overdue")
      loans = loans.filter(
        (loan) => !loan.returnedAt && loan.dueDate < today(),
      );
    loans.sort((a, b) => new Date(b.borrowedAt) - new Date(a.borrowedAt));
    const total = loans.length;
    const pages = Math.max(1, Math.ceil(total / 8));
    const page = Math.max(
      1,
      Math.min(pages, Number.parseInt(req.query.page) || 1),
    );
    res.json({
      loans: loans.slice((page - 1) * 8, page * 8),
      total,
      pages,
      page,
    });
  });
  app.use((req, res) =>
    res.status(404).json({ message: "Endpoint not found." }),
  );
  app.use((error, req, res, next) => {
    void next;
    if (error.code === 11000)
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    if (error.name === "ValidationError" || error.name === "CastError")
      return res
        .status(400)
        .json({ message: "Please check the values you entered." });
    const status = error.status || 500;
    if (status >= 500) console.error(error);
    res
      .status(status)
      .json({
        message:
          status >= 500
            ? "Something went wrong. Please try again."
            : error.message,
      });
  });
  return app;
}
