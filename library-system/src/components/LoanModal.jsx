import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import api, { errorMessage } from "../api";
import { activeLoan, formatDate, nextWeek, today } from "../utils";
export default function LoanModal({ book, onClose, onSaved }) {
  const checkout = book.status === "Available";
  const loan = activeLoan(book);
  const [form, setForm] = useState({
    borrower: "",
    borrowerId: "",
    dueDate: nextWeek(),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post(
        `/books/${book._id}/${checkout ? "checkout" : "return"}`,
        form,
      );
      onSaved(
        checkout
          ? "Book checked out successfully."
          : "Book returned successfully.",
      );
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal show onHide={busy ? () => {} : onClose} centered>
      <form onSubmit={submit}>
        <Modal.Header closeButton={!busy}>
          <Modal.Title>
            {checkout ? "Check out a book" : "Confirm book return"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="modal-book-title">{book.title}</p>
          <p className="subtitle">
            {checkout
              ? "Enter the reader’s details and return date."
              : `${loan.borrower} (${loan.borrowerId}) · Due ${formatDate(loan.dueDate)}`}
          </p>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          {checkout ? (
            <>
              <div className="field">
                <label htmlFor="borrower">Borrower name</label>
                <input
                  id="borrower"
                  className="form-control"
                  required
                  maxLength={80}
                  autoFocus
                  value={form.borrower}
                  onChange={(e) =>
                    setForm({ ...form, borrower: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="borrowerId">Student / member ID</label>
                <input
                  id="borrowerId"
                  className="form-control"
                  required
                  maxLength={40}
                  value={form.borrowerId}
                  onChange={(e) =>
                    setForm({ ...form, borrowerId: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="dueDate">Due date</label>
                <input
                  id="dueDate"
                  type="date"
                  className="form-control"
                  min={today()}
                  required
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                />
              </div>
            </>
          ) : (
            <p>
              The copy will become available again. The loan stays in your
              borrowing history.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-light"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy
              ? "Saving…"
              : checkout
                ? "Confirm checkout"
                : "Confirm return"}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
