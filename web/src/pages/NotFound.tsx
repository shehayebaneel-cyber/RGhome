import { useNavigate } from "react-router-dom";
import { useI18n } from "../lib/i18n";

export default function NotFound() {
  const { t } = useI18n();
  const nav = useNavigate();
  return (
    <div className="wrap empty" style={{ padding: "90px 20px" }}>
      <h2 style={{ color: "var(--navy)", fontSize: 30 }}>404</h2>
      <p style={{ margin: "8px 0 18px" }}>{t("This page doesn't exist.", "هذه الصفحة غير موجودة.")}</p>
      <button className="btn btn-primary" onClick={() => nav("/")}>
        {t("Back home", "العودة للرئيسية")}
      </button>
    </div>
  );
}
