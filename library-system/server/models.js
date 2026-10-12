import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);
// Each book record is one physical copy; ISBN can repeat for multiple copies.
// Embedded loans allow checkout/return in one atomic database update.
const loanSchema = new mongoose.Schema({
  borrower: { type: String, required: true },
  borrowerId: { type: String, required: true },
  borrowedAt: { type: Date, required: true },
  dueDate: { type: String, required: true },
  returnedAt: { type: Date, default: null },
});
const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    author: { type: String, required: true, trim: true, maxlength: 100 },
    isbn: { type: String, default: "" },
    category: { type: String, required: true },
    shelf: { type: String, required: true, trim: true, maxlength: 40 },
    status: {
      type: String,
      enum: ["Available", "Borrowed"],
      default: "Available",
    },
    loans: [loanSchema],
  },
  { timestamps: true },
);
export const User = mongoose.model("User", userSchema);
export const Book = mongoose.model("Book", bookSchema);
