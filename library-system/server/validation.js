export const categories = [
  "Technology",
  "Literature",
  "Science",
  "History",
  "Business",
  "General",
];
export function fail(status, message) {
  throw Object.assign(new Error(message), { status });
}
export function text(value, label, max = 100) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max)
    fail(400, `${label} is required and must be at most ${max} characters.`);
  return value.trim();
}
export function email(value) {
  const result = text(value, "Email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result))
    fail(400, "Enter a valid email address.");
  return result;
}
export function password(value) {
  // bcrypt only uses 72 bytes; reject longer values rather than truncate them.
  if (
    typeof value !== "string" ||
    value.length < 8 ||
    Buffer.byteLength(value) > 72
  )
    fail(
      400,
      "Password must be at least 8 characters and no more than 72 bytes.",
    );
  return value;
}
export function validIsbn(value) {
  if (typeof value !== "string") return false;
  const isbn = value.replace(/[\s-]/g, "").toUpperCase();
  if (/^\d{13}$/.test(isbn))
    return (
      [...isbn].reduce(
        (sum, digit, i) => sum + Number(digit) * (i % 2 ? 3 : 1),
        0,
      ) %
        10 ===
      0
    );
  if (/^\d{9}[\dX]$/.test(isbn))
    return (
      [...isbn].reduce(
        (sum, digit, i) =>
          sum + (digit === "X" ? 10 : Number(digit)) * (10 - i),
        0,
      ) %
        11 ===
      0
    );
  return false;
}
export function bookFields(body) {
  const fields = {
    title: text(body.title, "Title", 160),
    author: text(body.author, "Author", 100),
    isbn: text(body.isbn, "ISBN", 24).replace(/[\s-]/g, "").toUpperCase(),
    category: text(body.category, "Category", 40),
    shelf: text(body.shelf, "Shelf", 40),
  };
  if (!validIsbn(fields.isbn))
    fail(400, "Enter a valid ISBN-10 or ISBN-13, including its check digit.");
  if (!categories.includes(fields.category))
    fail(400, "Choose a valid category.");
  return fields;
}
export function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function dueDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number.isNaN(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value
  )
    fail(400, "Choose a valid due date.");
  if (value < today()) fail(400, "Due date cannot be in the past.");
  return value;
}
