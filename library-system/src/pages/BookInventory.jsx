import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Pencil, Trash2, ArrowUpRight } from "lucide-react";
import Modal from "react-bootstrap/Modal";
import useApi from "../hooks/useApi";
import api, { errorMessage } from "../api";
import {
  PageHeading,
  Status,
  BookMark,
  Empty,
  Loading,
  ErrorState,
  SearchField,
  Pager,
} from "../components/UI";
import LoanModal from "../components/LoanModal";
import { categories, copyCode, bookStatus } from "../utils";
export default function BookInventory() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "",
    status = params.get("status") || "",
    category = params.get("category") || "";
  const { data, loading, error, reload } = useApi(
    `/books?${params.toString()}`,
  );
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  function filter(key, value) {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    next.delete("page");
    setParams(next, { replace: true });
  }
  function saved(message) {
    setNotice(message);
    reload();
  }
  async function remove() {
    setBusy(true);
    setActionError("");
    try {
      await api.delete(`/books/${deleting._id}`);
      setDeleting(null);
      saved("Book deleted successfully.");
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        title="Book inventory"
        subtitle="A home for every book in your collection."
        action={
          <Link to="/add-book" className="btn btn-primary">
            <Plus size={18} />
            Add a book
          </Link>
        }
      />
      {notice && (
        <div className="alert alert-success alert-dismissible" role="status">
          {notice}
          <button
            className="btn-close"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          />
        </div>
      )}
      <section className="panel inventory-panel">
        <div className="inventory-heading">
          <h2>
            Your collection{" "}
            <span className="count-pill">
              {data?.total ?? "…"} {data?.total === 1 ? "copy" : "copies"}
            </span>
          </h2>
          <span className="muted">One record per physical copy</span>
        </div>
        <div className="filter-bar">
          <SearchField
            value={search}
            onChange={(value) => filter("search", value)}
            placeholder="Search title, author, ISBN, or shelf…"
          />
          <select
            className="form-select"
            aria-label="Filter by category"
            value={category}
            onChange={(e) => filter("category", e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <select
            className="form-select"
            aria-label="Filter by availability"
            value={status}
            onChange={(e) => filter("status", e.target.value)}
          >
            <option value="">All statuses</option>
            {["Available", "Borrowed", "Overdue"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          {(search || status || category) && (
            <button className="btn btn-light" onClick={() => setParams({})}>
              Clear
            </button>
          )}
        </div>
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} retry={reload} />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table library-table">
                <thead>
                  <tr>
                    <th>BOOK DETAILS</th>
                    <th>CATEGORY</th>
                    <th>SHELF</th>
                    <th>STATUS</th>
                    <th className="text-end">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.books.map((book) => (
                    <tr key={book._id}>
                      <td>
                        <div className="table-book">
                          <BookMark category={book.category} />
                          <div>
                            <Link
                              to={`/books/${book._id}/edit`}
                              className="book-title"
                            >
                              {book.title}
                            </Link>
                            <small>{book.author}</small>
                            <small className="book-code">
                              {copyCode(book._id)} · {book.isbn}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-tag">{book.category}</span>
                      </td>
                      <td className="shelf-cell">{book.shelf}</td>
                      <td>
                        <Status value={bookStatus(book)} />
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className={`btn btn-sm ${book.status === "Available" ? "btn-outline-primary" : "btn-primary"}`}
                            onClick={() => setSelected(book)}
                          >
                            {book.status === "Available"
                              ? "Check out"
                              : "Return"}
                            <ArrowUpRight size={13} />
                          </button>
                          <Link
                            to={`/books/${book._id}/edit`}
                            className="icon-button"
                            aria-label={`Edit ${book.title}`}
                          >
                            <Pencil size={16} />
                          </Link>
                          <button
                            className="icon-button delete-button"
                            disabled={book.loans.length > 0}
                            title={
                              book.loans.length
                                ? "Loan history must be preserved"
                                : "Delete book"
                            }
                            aria-label={`Delete ${book.title}`}
                            onClick={() => {
                              setActionError("");
                              setDeleting(book);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!data.books.length && (
              <Empty
                title={
                  search || status || category
                    ? "No matching books"
                    : "Your shelves are ready"
                }
              >
                {search || status || category
                  ? "Try another search or clear your filters."
                  : "Add your first book to start your library."}
              </Empty>
            )}
            <Pager
              data={data}
              onPage={(page) => {
                const next = new URLSearchParams(params);
                next.set("page", page);
                setParams(next);
              }}
            />
          </>
        )}
      </section>
      {selected && (
        <LoanModal
          book={selected}
          onClose={() => setSelected(null)}
          onSaved={saved}
        />
      )}
      <Modal
        show={Boolean(deleting)}
        onHide={() => !busy && setDeleting(null)}
        centered
      >
        <Modal.Header closeButton={!busy}>
          <Modal.Title>Delete this book?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Remove <strong>{deleting?.title}</strong> from your inventory? This
            action cannot be undone.
          </p>
          {actionError && <ErrorState message={actionError} />}
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-light"
            disabled={busy}
            onClick={() => setDeleting(null)}
          >
            Cancel
          </button>
          <button className="btn btn-danger" disabled={busy} onClick={remove}>
            {busy ? "Deleting…" : "Delete book"}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
