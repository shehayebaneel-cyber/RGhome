import { useParams, useNavigate } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { WA, TEL } from "../components/Layout";

export default function OrderConfirm() {
  const { ref } = useParams();
  const { t } = useI18n();
  const nav = useNavigate();
  return (
    <div className="wrap" style={{ maxWidth: 600 }}>
      <div className="empty" style={{ padding: "70px 20px" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--good)" strokeWidth="1.6" style={{ width: 64, height: 64, marginBottom: 16 }}>
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12l3 3 5-6" />
        </svg>
        <h2 style={{ color: "var(--navy)", fontSize: 28 }}>{t("Order received!", "تم استلام طلبكم!")}</h2>
        <p style={{ margin: "10px 0 6px", fontSize: 16 }}>
          {t("Your order reference is", "رقم طلبكم هو")} <b style={{ color: "var(--ink)" }}>{ref}</b>
        </p>
        <p style={{ maxWidth: "32em", margin: "0 auto 22px" }}>
          {t(
            "Thank you! Our team will call you shortly on the number you gave to confirm delivery. You can also reach us any time.",
            "شكراً لكم! سيتصل بكم فريقنا قريباً على الرقم الذي زوّدتمونا به لتأكيد التوصيل. يمكنكم أيضاً التواصل معنا في أي وقت."
          )}
        </p>
        <div style={{ display: "flex", gap: 11, justifyContent: "center", flexWrap: "wrap" }}>
          <a className="btn btn-wa" href={WA}>
            {t("Message us on WhatsApp", "راسلونا على واتساب")}
          </a>
          <a className="btn btn-ghost" href={TEL}>
            {t("Call the store", "اتصلوا بالمتجر")}
          </a>
          <button className="btn btn-primary" onClick={() => nav("/shop")}>
            {t("Continue shopping", "متابعة التسوّق")}
          </button>
        </div>
      </div>
    </div>
  );
}
