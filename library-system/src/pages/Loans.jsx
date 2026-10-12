import { useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api";
import useApi from "../hooks/useApi";
import {
  PageHeading,
  SearchField,
  Loading,
  ErrorState,
  Empty,
  Status,
  Pager,
} from "../components/UI";
import LoanModal from "../components/LoanModal";
import { formatDate, today } from "../utils";
export default function Loans() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Active");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const { data, loading, error, reload } = useApi(
    `/loans?${new URLSearchParams({ search, status, page })}`,
  );
  async function returnBook(id) {
    setActionError("");
    try {
      setSelected((await api.get(`/books/${id}`)).data);
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }
  return (
    <>
      <PageHeading
        title="Borrowing & returns"
        subtitle="Every reader, every loan, and every return in one place."
        action={
          <Link to="/inventory" className="btn btn-primary">
            Check out a book
          </Link>
        }
      />
      {notice && (
        <div className="alert alert-success" role="status">
          {notice}
        </div>
      )}
      {actionError && <ErrorState message={actionError} />}
      <section className="panel inventory-panel">
        <div className="loan-tabs" role="group" aria-label="Loan status">
          {["Active", "Overdue", "Returned", "All"].map((value) => (
            <button
              key={value}
              className={status === value ? "active" : ""}
              aria-pressed={status === value}
              onClick={() => {
                setStatus(value);
                setPage(1);
              }}
            >
              {value === "Active"
                ? "Active loans"
                : value === "All"
                  ? "All history"
                  : value}
            </button>
          ))}
        </div>
        <div className="filter-bar">
          <SearchField
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search book, borrower, or member ID…"
          />
          <span className="muted">{data?.total ?? "…"} records</span>
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
                    <th>BOOK</th>
                    <th>BORROWER</th>
                    <th>BORROWED</th>
                    <th>DUE DATE</th>
                    <th>STATUS</th>
                    <th className="text-end">RETURN</th>
                  </tr>
                </thead>
                <tbody>
                  {data.loans.map((loan) => (
                    <tr key={loan._id}>
                      <td>
                        <Link
                          className="book-title"
                          to={`/books/${loan.bookId}/edit`}
                        >
                          {loan.title}
                        </Link>
                        <small className="cell-small">{loan.author}</small>
                      </td>
                      <td>
                        <strong className="borrower-name">
                          {loan.borrower}
                        </strong>
                        <small className="cell-small">{loan.borrowerId}</small>
                      </td>
                      <td className="date-cell">
                        {formatDate(loan.borrowedAt)}
                      </td>
                      <td className="date-cell">{formatDate(loan.dueDate)}</td>
                      <td>
                        <Status
                          value={
                            loan.returnedAt
                              ? "Returned"
                              : loan.dueDate < today()
                                ? "Overdue"
                                : "Borrowed"
                          }
                        />
                      </td>
                      <td className="text-end">
                        {loan.returnedAt ? (
                          <small>{formatDate(loan.returnedAt)}</small>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => returnBook(loan.bookId)}
                          >
                            Return book
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!data.loans.length && (
              <Empty title="No loans to show">
                Borrowing records will appear here after a book is checked out.
              </Empty>
            )}
            <Pager data={data} onPage={setPage} />
          </>
        )}
      </section>
      {selected && (
        <LoanModal
          book={selected}
          onClose={() => setSelected(null)}
          onSaved={(message) => {
            setNotice(message);
            reload();
          }}
        />
      )}
    </>
  );
}
