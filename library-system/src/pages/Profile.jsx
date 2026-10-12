import { useState } from "react";
import { Check, ShieldCheck, LogOut } from "lucide-react";
import api, { errorMessage } from "../api";
import { PageHeading, ErrorState } from "../components/UI";
import { formatDate } from "../utils";
export default function Profile({ user, onUserUpdate, onLogout }) {
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.put("/auth/profile", form);
      onUserUpdate(data);
      setNotice("Your profile has been updated.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        title="My profile"
        subtitle="The person behind your library workspace."
      />
      <div className="form-layout">
        <section className="panel book-form">
          <div className="profile-summary">
            <span className="avatar large">{user.name.slice(0, 1)}</span>
            <div>
              <h2>{user.name}</h2>
              <p>Account created {formatDate(user.createdAt)}</p>
            </div>
          </div>
          {error && <ErrorState message={error} />}
          {notice && (
            <div className="alert alert-success" role="status">
              {notice}
            </div>
          )}
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="profileName">Full name</label>
              <input
                id="profileName"
                className="form-control"
                autoComplete="name"
                required
                maxLength={80}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="profileEmail">Email address</label>
              <input
                id="profileEmail"
                className="form-control"
                autoComplete="email"
                type="email"
                required
                maxLength={254}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-footer">
              <button className="btn btn-primary" disabled={busy}>
                <Check size={17} />
                {busy ? "Saving…" : "Save profile"}
              </button>
            </div>
          </form>
        </section>
        <aside className="info-card">
          <ShieldCheck size={25} />
          <h3>Your account</h3>
          <p>
            Your password is stored as a secure hash. Your session expires after
            eight hours.
          </p>
          <p>Signing out ends all active sessions for this account.</p>
          <button className="btn btn-outline-primary mt-3" onClick={onLogout}>
            <LogOut size={16} />
            Sign out
          </button>
        </aside>
      </div>
    </>
  );
}
