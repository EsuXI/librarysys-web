export const categories = [
  "Technology",
  "Literature",
  "Science",
  "History",
  "Business",
  "General",
];
export function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function nextWeek() {
  return new Date(Date.parse(`${today()}T00:00:00Z`) + 7 * 86400000)
    .toISOString()
    .slice(0, 10);
}
export function formatDate(value) {
  return value
    ? new Intl.DateTimeFormat("en-PH", {
        timeZone: "Asia/Manila",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(
        new Date(value.length === 10 ? `${value}T00:00:00+08:00` : value),
      )
    : "—";
}
export function activeLoan(book) {
  return book.loans.find((loan) => !loan.returnedAt);
}
export function bookStatus(book) {
  return book.status === "Borrowed" && activeLoan(book)?.dueDate < today()
    ? "Overdue"
    : book.status;
}
export function copyCode(id) {
  return `BK-${id.slice(-6).toUpperCase()}`;
}
