import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from "react-router-dom";
import { BookOpen } from "lucide-react";
import Navbar from "./components/Navbar";
import { Loading, ErrorState } from "./components/UI";
import Dashboard from "./pages/Dashboard";
import BookInventory from "./pages/BookInventory";
import AddBook from "./pages/AddBook";
import Loans from "./pages/Loans";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import api, { errorMessage } from "./api";
import "./App.css";

function Workspace({ user, onLogout, onUserUpdate, demo }) {
  const location = useLocation();
  const titles = {
    "/": "Overview",
    "/inventory": "Book inventory",
    "/loans": "Borrowing & returns",
    "/add-book": "Add a book",
    "/profile": "My profile",
  };
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar user={user} onLogout={onLogout} />
      <div className="workspace">
        <header className="topbar">
          <span>
            <BookOpen size={16} /> Library workspace{" "}
            <span className="breadcrumb-separator">/</span>{" "}
            <strong>{titles[location.pathname] || "Book details"}</strong>
          </span>
          <Link to="/profile" className="topbar-profile">
            <span className="avatar mini">{user.name.slice(0, 1)}</span>
            {user.name}
          </Link>
        </header>
        {demo && (
          <div className="demo-banner">
            Sample preview · Temporary database. Changes reset when the demo
            server stops.
          </div>
        )}
        <main id="main-content" className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/inventory" element={<BookInventory />} />
            <Route
              path="/add-book"
              element={<AddBook key={location.pathname} />}
            />
            <Route
              path="/books/:id/edit"
              element={<AddBook key={location.pathname} />}
            />
            <Route path="/loans" element={<Loans />} />
            <Route
              path="/profile"
              element={
                <Profile
                  user={user}
                  onUserUpdate={onUserUpdate}
                  onLogout={onLogout}
                />
              }
            />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
            <Route
              path="*"
              element={
                <div className="empty-state">
                  <h1>Page not found</h1>
                  <Link to="/">Return to overview</Link>
                </div>
              }
            />
          </Routes>
        </main>
        <footer className="app-footer">
          <span>LibrarySys</span> A little more organized. A lot more
          possibilities.
        </footer>
      </div>
    </div>
  );
}
export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    let active = true;
    api
      .get("/health")
      .then((response) => {
        if (active) setDemo(response.data.demo);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    if (sessionStorage.getItem("librarysys-token")) {
      api
        .get("/auth/me")
        .then((response) => {
          if (active) setUser(response.data);
        })
        .catch((err) => {
          if (active && err.response?.status !== 401)
            setError(errorMessage(err));
        })
        .finally(() => {
          if (active) setChecking(false);
        });
    } else {
      Promise.resolve().then(() => {
        if (active) setChecking(false);
      });
    }
    const expire = () => {
      setUser(null);
      setError("Your session has ended. Please sign in again.");
    };
    window.addEventListener("librarysys-session-expired", expire);
    return () => {
      active = false;
      window.removeEventListener("librarysys-session-expired", expire);
    };
  }, []);
  function onAuthenticated(data) {
    sessionStorage.setItem("librarysys-token", data.token);
    setUser(data.user);
    setError("");
  }
  async function logout() {
    try {
      await api.post("/auth/logout");
      sessionStorage.removeItem("librarysys-token");
      setUser(null);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }
  if (checking) return <Loading />;
  return (
    <BrowserRouter>
      {user ? (
        <>
          {error && (
            <div className="global-alert">
              <ErrorState message={error} />
            </div>
          )}
          <Workspace
            user={user}
            onLogout={logout}
            onUserUpdate={setUser}
            demo={demo}
          />
        </>
      ) : (
        <Routes>
          <Route
            path="/register"
            element={
              <Auth
                register
                onAuthenticated={onAuthenticated}
                initialError={error}
                demo={demo}
              />
            }
          />
          <Route
            path="/login"
            element={
              <Auth
                onAuthenticated={onAuthenticated}
                initialError={error}
                demo={demo}
              />
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}
