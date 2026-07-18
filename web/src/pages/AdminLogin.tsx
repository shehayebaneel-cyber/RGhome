import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { api } from "../lib/api";
import { Logo } from "../components/Art";

export default function AdminLogin() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.login(email, password);
      nav("/admin");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={submit}>
        <div className="logo" style={{ justifyContent: "center", marginBottom: 6 }}>
          <Logo />
        </div>
        <h1>{t("Admin sign in", "دخول الإدارة")}</h1>
        <p className="sub">{t("RG Home Aley · store dashboard", "آر جي هوم عاليه · لوحة المتجر")}</p>
        {error && <div className="notice err">{error}</div>}
        <div className="field">
          <label>{t("Email", "البريد الإلكتروني")}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        </div>
        <div className="field">
          <label>{t("Password", "كلمة المرور")}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={busy} style={{ marginTop: 6 }}>
          {busy ? t("Signing in…", "جارٍ الدخول…") : t("Sign in", "تسجيل الدخول")}
        </button>
        <a className="auth-back" onClick={() => nav("/")}>
          {t("← Back to store", "→ العودة إلى المتجر")}
        </a>
      </form>
    </div>
  );
}
