import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react";
export function PageHeading({
  eyebrow = "LIBRARY WORKSPACE",
  title,
  subtitle,
  action,
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
export function Status({ value }) {
  return (
    <span className={`status status-${value.toLowerCase()}`}>
      <span />
      {value}
    </span>
  );
}
export function BookMark({ category = "General", small = false }) {
  return (
    <span
      className={`book-mark category-${category.toLowerCase()} ${small ? "small" : ""}`}
    >
      <BookOpen size={small ? 18 : 23} strokeWidth={1.6} />
    </span>
  );
}
export function Empty({ title, children }) {
  return (
    <div className="empty-state">
      <BookOpen size={32} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading-state" role="status">
      <span className="spinner-border spinner-border-sm" /> Loading library
      records…
    </div>
  );
}
export function ErrorState({ message, retry }) {
  return (
    <div className="alert alert-danger" role="alert">
      {message}
      {retry && (
        <button className="btn btn-sm btn-outline-danger ms-3" onClick={retry}>
          <RefreshCw size={14} /> Try again
        </button>
      )}
    </div>
  );
}
export function SearchField({ value, onChange, placeholder }) {
  return (
    <div className="search-field">
      <Search size={18} />
      <input
        type="search"
        className="form-control"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
export function Pager({ data, onPage }) {
  return (
    <div className="pager">
      <span>
        {data.total
          ? `${(data.page - 1) * 8 + 1}–${Math.min(data.page * 8, data.total)} of ${data.total} records`
          : "0 records"}
      </span>
      <nav aria-label="Pagination">
        <button
          className="btn btn-light"
          aria-label="Previous page"
          disabled={data.page === 1}
          onClick={() => onPage(data.page - 1)}
        >
          <ChevronLeft size={16} />
        </button>
        <span>
          Page {data.page} of {data.pages}
        </span>
        <button
          className="btn btn-light"
          aria-label="Next page"
          disabled={data.page === data.pages}
          onClick={() => onPage(data.page + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}
