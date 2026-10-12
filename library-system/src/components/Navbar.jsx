import { NavLink, Link } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  Library,
  ArrowLeftRight,
  Plus,
  UserRound,
  LogOut,
} from "lucide-react";
export default function Navbar({ user, onLogout }) {
  return (
    <aside className="sidebar">
      <Link className="brand" to="/">
        <span className="brand-icon">
          <BookOpen size={23} />
        </span>
        <span>
          Library<span className="brand-light">Sys</span>
          <small>LIBRARY MANAGEMENT</small>
        </span>
      </Link>
      <p className="nav-label">WORKSPACE</p>
      <nav className="main-nav" aria-label="Main navigation">
        <NavLink to="/" end>
          <LayoutDashboard size={19} />
          Overview
        </NavLink>
        <NavLink to="/inventory">
          <Library size={19} />
          Book inventory
        </NavLink>
        <NavLink to="/loans">
          <ArrowLeftRight size={19} />
          Borrowing & returns
        </NavLink>
        <NavLink to="/add-book">
          <Plus size={19} />
          Add a book
        </NavLink>
      </nav>
      <div className="sidebar-note">
        <BookOpen size={25} />
        <strong>A place for every book.</strong>
        <p>Keep your collection organized and your readers connected.</p>
        <Link to="/inventory">
          Explore your library <span>→</span>
        </Link>
      </div>
      <div className="sidebar-bottom">
        <NavLink to="/profile" className="user-link">
          <span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span>
          <span>
            <strong>{user.name}</strong>
            <small>Library workspace</small>
          </span>
          <UserRound size={16} />
        </NavLink>
        <button className="logout" onClick={onLogout}>
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
