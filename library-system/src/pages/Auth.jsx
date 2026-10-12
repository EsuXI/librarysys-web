import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ArrowRight,
  Library,
  ShieldCheck,
  ArrowLeftRight,
} from "lucide-react";
import api, { errorMessage } from "../api";
export default function Auth({
  register = false,
  onAuthenticated,
  initialError,
  demo,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  async function submit(e) {
    e.preventDefault();
    if (register && form.password !== form.confirm)
      return setError("Your passwords do not match.");
    setBusy(true);
    setError("");
    try {
      const response = await api.post(
        `/auth/${register ? "register" : "login"}`,
        form,
      );
      onAuthenticated(response.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <section className="auth-story">
        <div className="brand">
          <span className="brand-icon">
            <BookOpen size={25} />
          </span>
          <span>
            Library<span className="brand-light">Sys</span>
          </span>
        </div>
        <div className="auth-story-content">
          <p className="eyebrow">YOUR LIBRARY, IN GOOD HANDS</p>
          <h1>
            Great stories.
            <br />
            Better organized.
          </h1>
          <p>
            A simple home for your collection, your readers, and everything in
            between.
          </p>
          <div className="book-illustration" aria-hidden="true">
            <div>KNOWLEDGE</div>
            <div>DISCOVER</div>
            <div>STORIES</div>
            <BookOpen size={68} strokeWidth={1} />
          </div>
          <ul>
            <li>
              <Library size={18} />A clear view of every book
            </li>
            <li>
              <ArrowLeftRight size={18} />
              Borrowing and returns made simple
            </li>
            <li>
              <ShieldCheck size={18} />A secure library workspace
            </li>
          </ul>
        </div>
        <small>LIBRARY MANAGEMENT SYSTEM</small>
      </section>
      <section className="auth-form-area">
        <div className="auth-form">
          <p className="eyebrow">LET’S GET STARTED</p>
          <h2>{register ? "Create your account" : "Welcome back"}</h2>
          <p className="subtitle">
            {register
              ? "Join the shared library workspace."
              : "Sign in to take care of your library."}
          </p>
          {(error || initialError) && (
            <div className="alert alert-danger" role="alert">
              {error || initialError}
            </div>
          )}
          <form onSubmit={submit}>
            {register && (
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  className="form-control"
                  autoComplete="name"
                  required
                  maxLength={80}
                  value={form.name}
                  onChange={change}
                />
              </div>
            )}
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                required
                maxLength={254}
                autoComplete="email"
                value={form.email}
                onChange={change}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                required
                minLength={8}
                maxLength={72}
                autoComplete={register ? "new-password" : "current-password"}
                value={form.password}
                onChange={change}
              />
              {register && <small>Use at least 8 characters.</small>}
            </div>
            {register && (
              <div className="field">
                <label htmlFor="confirm">Confirm password</label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  className="form-control"
                  required
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={change}
                />
              </div>
            )}
            <button
              className="btn btn-primary w-100 auth-submit"
              disabled={busy}
            >
              {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
              <ArrowRight size={17} />
            </button>
          </form>
          <p className="auth-switch">
            {register ? "Already have an account?" : "New to LibrarySys?"}{" "}
            <Link to={register ? "/login" : "/register"}>
              {register ? "Sign in" : "Create an account"}
            </Link>
          </p>
          {demo && (
            <div className="demo-login">
              <strong>Try the sample library</strong>
              <p>Use the demo account to explore the web app.</p>
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() =>
                  setForm({
                    ...form,
                    email: "demo@librarysys.test",
                    password: "LibraryDemo2026!",
                  })
                }
              >
                Fill demo credentials
              </button>
              <small>Sample data resets when the server stops.</small>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
