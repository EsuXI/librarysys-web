import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Check, Info } from "lucide-react";
import api, { errorMessage } from "../api";
import { PageHeading, ErrorState, Loading } from "../components/UI";
import { categories, copyCode, formatDate } from "../utils";
export default function AddBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "Technology",
    shelf: "",
  });
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (id)
      api
        .get(`/books/${id}`)
        .then(({ data }) => {
          if (active) {
            setBook(data);
            setForm({
              title: data.title,
              author: data.author,
              isbn: data.isbn || "",
              category: data.category,
              shelf: data.shelf,
            });
          }
        })
        .catch((err) => {
          if (active) setError(errorMessage(err));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    return () => {
      active = false;
    };
  }, [id]);
  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (id) await api.put(`/books/${id}`, form);
      else await api.post("/books", form);
      navigate("/inventory");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <Loading />;
  return (
    <>
      <Link to="/inventory" className="back-link">
        <ArrowLeft size={16} />
        Back to inventory
      </Link>
      <PageHeading
        title={id ? "Edit book details" : "A new book, a new possibility."}
        subtitle={
          id
            ? "Keep your catalog accurate and up to date."
            : "Add a physical copy to your library collection."
        }
      />
      <div className="form-layout">
        <section className="panel book-form">
          <div className="panel-heading">
            <div>
              <h2>Book information</h2>
              <p>
                {book
                  ? copyCode(book._id)
                  : "All fields except ISBN are required."}
              </p>
            </div>
            <BookOpen size={22} />
          </div>
          {error && <ErrorState message={error} />}
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="title">Book title</label>
              <input
                id="title"
                name="title"
                className="form-control"
                required
                maxLength={160}
                placeholder="e.g. The Pragmatic Programmer"
                value={form.title}
                onChange={change}
              />
            </div>
            <div className="field">
              <label htmlFor="author">Author</label>
              <input
                id="author"
                name="author"
                className="form-control"
                required
                maxLength={100}
                placeholder="e.g. David Thomas & Andrew Hunt"
                value={form.author}
                onChange={change}
              />
            </div>
            <div className="field">
              <label htmlFor="isbn">ISBN (optional)</label>
              <input
                id="isbn"
                name="isbn"
                className="form-control"
                maxLength={24}
                placeholder="e.g. 978-0135957059"
                value={form.isbn}
                onChange={change}
              />
              <small>
                Leave blank if the book has no ISBN. If entered, use a valid
                ISBN-10 or ISBN-13.
              </small>
            </div>
            <div className="two-fields">
              <div className="field">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  className="form-select"
                  value={form.category}
                  onChange={change}
                >
                  {categories.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="shelf">Shelf location</label>
                <input
                  id="shelf"
                  name="shelf"
                  className="form-control"
                  required
                  maxLength={40}
                  placeholder="e.g. A-01 or Shelf A, section 1"
                  value={form.shelf}
                  onChange={change}
                />
                <small>
                  Where the book is kept. Use your library’s own shelf labels.
                </small>
              </div>
            </div>
            <div className="form-footer">
              <Link to="/inventory" className="btn btn-light">
                Cancel
              </Link>
              <button
                className="btn btn-primary"
                disabled={busy || (Boolean(id) && !book)}
              >
                <Check size={17} />
                {busy ? "Saving…" : id ? "Save changes" : "Save book"}
              </button>
            </div>
          </form>
        </section>
        <aside className="form-aside">
          <div className="info-card">
            <Info size={22} />
            <h3>A few helpful notes</h3>
            <p>
              Each record represents one physical copy. Add another record if
              your library has multiple copies of the same title.
            </p>
            <p>
              New copies are available immediately. Check them out from the
              inventory when a reader borrows them.
            </p>
            <p>
              The ISBN identifies the edition. The copy ID identifies the
              individual book in your library.
            </p>
          </div>
          {book && (
            <div className="info-card">
              <h3>Loan history</h3>
              {book.loans.length ? (
                book.loans
                  .slice()
                  .reverse()
                  .map((loan) => (
                    <div className="history-item" key={loan._id}>
                      <strong>{loan.borrower}</strong>
                      <small>
                        {loan.borrowerId} · {formatDate(loan.borrowedAt)}
                      </small>
                      <small>
                        {loan.returnedAt
                          ? `Returned ${formatDate(loan.returnedAt)}`
                          : `Due ${formatDate(loan.dueDate)}`}
                      </small>
                    </div>
                  ))
              ) : (
                <p>No loans recorded for this copy yet.</p>
              )}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
