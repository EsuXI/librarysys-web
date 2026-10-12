import { Link } from "react-router-dom";
import {
  Plus,
  ArrowUpRight,
  Library,
  BookCheck,
  ArrowLeftRight,
  Clock3,
  ArrowRight,
} from "lucide-react";
import useApi from "../hooks/useApi";
import {
  PageHeading,
  BookMark,
  Status,
  Loading,
  ErrorState,
  Empty,
} from "../components/UI";
import { activeLoan, bookStatus, formatDate } from "../utils";
export default function Dashboard({ user }) {
  const { data, loading, error, reload } = useApi("/dashboard");
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;
  const stats = [
    [
      "Total books",
      data.total,
      "Copies in your collection",
      Library,
      "",
      "/inventory",
    ],
    [
      "Available",
      data.available,
      "Ready for the next reader",
      BookCheck,
      "green",
      "/inventory?status=Available",
    ],
    [
      "Borrowed",
      data.borrowed,
      "Currently with readers",
      ArrowLeftRight,
      "blue",
      "/inventory?status=Borrowed",
    ],
    [
      "Overdue",
      data.overdue,
      "Past their return date",
      Clock3,
      "amber",
      "/inventory?status=Overdue",
    ],
  ];
  return (
    <>
      <PageHeading
        title={`Hello, ${user.name.split(" ")[0]}.`}
        subtitle="Here’s what’s happening in your library today."
        action={
          <Link to="/add-book" className="btn btn-primary">
            <Plus size={18} />
            Add a book
          </Link>
        }
      />
      <div className="stats-grid">
        {stats.map(([label, value, hint, Icon, color, to]) => (
          <Link to={to} className={`stat-card ${color}`} key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <span className="stat-icon">
                <Icon size={20} />
              </span>
            </div>
            <strong>{value.toString().padStart(2, "0")}</strong>
            <p>
              {hint}
              <ArrowUpRight size={15} />
            </p>
          </Link>
        ))}
      </div>
      <section className="welcome-card">
        <div>
          <p className="eyebrow">A WELL-KEPT LIBRARY STARTS HERE</p>
          <h2>
            More time for readers.
            <br />
            Less time for paperwork.
          </h2>
          <p>
            Manage your collection and keep every loan on track,
            <br className="desktop-break" /> all from one simple workspace.
          </p>
          <Link to="/inventory" className="btn btn-dark">
            Browse inventory
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="shelf-art" aria-hidden="true">
          <div className="art-circle" />
          <div className="art-book one">READ</div>
          <div className="art-book two">DISCOVER</div>
          <div className="art-book three">
            <BookCheck size={32} />
          </div>
          <div className="art-book four">LEARN</div>
          <div className="art-shelf" />
        </div>
      </section>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recently added</h2>
              <p>The newest books on your shelves</p>
            </div>
            <Link to="/inventory">
              View all
              <ArrowUpRight size={15} />
            </Link>
          </div>
          {data.recent.length ? (
            <div className="book-list">
              {data.recent.map((book) => (
                <Link
                  to={`/books/${book._id}/edit`}
                  className="book-list-row"
                  key={book._id}
                >
                  <BookMark category={book.category} />
                  <div>
                    <strong>{book.title}</strong>
                    <small>{book.author}</small>
                  </div>
                  <Status value={bookStatus(book)} />
                </Link>
              ))}
            </div>
          ) : (
            <Empty title="Your first chapter starts here">
              Add your first book to build your collection.
            </Empty>
          )}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>On loan</h2>
              <p>Keep an eye on upcoming returns</p>
            </div>
            <Link to="/loans">
              View all
              <ArrowUpRight size={15} />
            </Link>
          </div>
          {data.activeLoans.length ? (
            <div className="loan-list">
              {data.activeLoans.map((book) => {
                const loan = activeLoan(book);
                return (
                  <Link to="/loans" className="loan-list-row" key={book._id}>
                    <span className="avatar">{loan.borrower.slice(0, 1)}</span>
                    <div>
                      <strong>{loan.borrower}</strong>
                      <small>{book.title}</small>
                    </div>
                    <div className="loan-due">
                      <small>Due {formatDate(loan.dueDate)}</small>
                      <Status value={bookStatus(book)} />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Empty title="All books are home">
              Checked-out books will appear here.
            </Empty>
          )}
          <div className="panel-tip">
            <Clock3 size={17} />
            <span>
              {data.overdue
                ? `${data.overdue} ${data.overdue === 1 ? "book needs" : "books need"} a return follow-up.`
                : "You’re all caught up. No overdue books."}
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
