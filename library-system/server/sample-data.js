import bcrypt from "bcryptjs";
import { Book, User } from "./models.js";
import { today } from "./validation.js";
const samples = [
  [
    "The Pragmatic Programmer",
    "David Thomas & Andrew Hunt",
    "9780135957059",
    "Technology",
    "T-01",
  ],
  ["Clean Code", "Robert C. Martin", "9780132350884", "Technology", "T-02"],
  ["Atomic Habits", "James Clear", "9780735211292", "General", "G-01"],
  [
    "The Great Gatsby",
    "F. Scott Fitzgerald",
    "9780743273565",
    "Literature",
    "L-01",
  ],
  [
    "A Brief History of Time",
    "Stephen Hawking",
    "9780553380163",
    "Science",
    "S-01",
  ],
  ["Sapiens", "Yuval Noah Harari", "9780062316097", "History", "H-01"],
  ["The Lean Startup", "Eric Ries", "9780307887894", "Business", "B-01"],
  [
    "To Kill a Mockingbird",
    "Harper Lee",
    "9780061120084",
    "Literature",
    "L-02",
  ],
  [
    "Eloquent JavaScript",
    "Marijn Haverbeke",
    "9781593279509",
    "Technology",
    "T-03",
  ],
  [
    "The Psychology of Money",
    "Morgan Housel",
    "9780857197689",
    "Business",
    "B-02",
  ],
  ["The Hobbit", "J. R. R. Tolkien", "9780547928227", "Literature", "L-03"],
  ["Cosmos", "Carl Sagan", "9780345539434", "Science", "S-02"],
];
export async function seedSamples() {
  if ((await User.exists({})) || (await Book.exists({})))
    throw new Error(
      "Seed only an empty library. Existing data has been left unchanged.",
    );
  await User.create({
    name: "Alex Librarian",
    email: "demo@librarysys.test",
    password: await bcrypt.hash("LibraryDemo2026!", 12),
  });
  const now = new Date();
  const daysFromToday = (days) =>
    new Date(Date.parse(`${today()}T00:00:00Z`) + days * 86400000)
      .toISOString()
      .slice(0, 10);
  await Book.insertMany(
    samples.map(([title, author, isbn, category, shelf], index) => ({
      title,
      author,
      isbn,
      category,
      shelf,
      status: index < 3 ? "Borrowed" : "Available",
      createdAt: new Date(now.getTime() - index * 86400000),
      loans:
        index < 3
          ? [
              {
                borrower: ["Jamie Santos", "Maria Reyes", "Paolo Cruz"][index],
                borrowerId: `2026-00${index + 1}`,
                borrowedAt: new Date(now.getTime() - 7 * 86400000),
                dueDate: daysFromToday(index === 0 ? -2 : index + 2),
                returnedAt: null,
              },
            ]
          : [],
    })),
  );
}
