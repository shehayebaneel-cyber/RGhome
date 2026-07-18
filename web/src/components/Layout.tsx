import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useI18n } from "../lib/i18n";
import { useCart } from "../lib/cart";
import { Logo } from "./Art";

const WA = "https://wa.me/96170556970";
const TEL = "tel:+96170556970";

function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="lang" role="group" aria-label="Language">
      <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>
        EN
      </button>
      <button className={lang === "ar" ? "on" : ""} onClick={() => setLang("ar")}>
        ع
      </button>
    </div>
  );
}

function Header() {
  const { t } = useI18n();
  const { count } = useCart();
  const nav = useNavigate();
  return (
    <header className="site">
      <div className="wrap bar">
        <div className="logo" onClick={() => nav("/")}>
          <Logo />
          <span className="name">
            RG&nbsp;HOME<small>ALEY</small>
          </span>
        </div>
        <nav className="main">
          <NavLink to="/" end>
            {t("Home", "الرئيسية")}
          </NavLink>
          <NavLink to="/shop">{t("Shop", "المتجر")}</NavLink>
          <NavLink to="/shop/ac">{t("Air conditioners", "مكيّفات")}</NavLink>
          <Link to="/#visit">{t("Visit", "زورونا")}</Link>
        </nav>
        <div className="head-actions">
          <LangToggle />
          <button className="icon-btn" onClick={() => nav("/cart")} aria-label={t("Cart", "السلة")}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
              <path d="M2 3h2.2l2.3 12.3a2 2 0 0 0 2 1.7h8.4a2 2 0 0 0 2-1.6L21 7H6" />
            </svg>
            {count > 0 && <span className="cart-count">{count}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="site">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <span className="logo">
              <span className="name" style={{ color: "#fff" }}>
                RG&nbsp;HOME<small>ALEY</small>
              </span>
            </span>
            <p className="fnote">
              {t(
                "Home appliances & consumer electronics, serving Aley and Mount Lebanon since 2020.",
                "أجهزة منزلية وإلكترونيات، في خدمة عاليه وجبل لبنان منذ ٢٠٢٠."
              )}
            </p>
          </div>
          <div>
            <h4>{t("Shop", "المتجر")}</h4>
            <ul>
              <li>
                <Link to="/shop/ac">{t("Air conditioners", "مكيّفات")}</Link>
              </li>
              <li>
                <Link to="/shop/tv">{t("TVs & screens", "شاشات وتلفزيونات")}</Link>
              </li>
              <li>
                <Link to="/shop/coffee">{t("Kitchen & cooking", "مطبخ وطبخ")}</Link>
              </li>
              <li>
                <Link to="/shop">{t("All products", "كل المنتجات")}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>{t("Contact", "تواصلوا")}</h4>
            <ul>
              <li>
                <a href={TEL}>05 556 970</a>
              </li>
              <li>
                <a href="mailto:rghome.aley@hotmail.com">rghome.aley@hotmail.com</a>
              </li>
              <li>
                <a href="https://instagram.com/rghome_aley">@rghome_aley</a>
              </li>
              <li>
                <Link to="/admin/login">{t("Admin login", "دخول الإدارة")}</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 RG Home Aley</span>
          <span>{t("Debbas Street, Old Souk, Aley, Lebanon", "شارع دبّاس، السوق القديم، عاليه، لبنان")}</span>
        </div>
      </div>
    </footer>
  );
}

function MobileBar() {
  const { t } = useI18n();
  const nav = useNavigate();
  return (
    <div className="mobile-bar">
      <a className="btn btn-primary" href={TEL} style={{ flex: "0 0 auto", padding: "12px 15px" }} aria-label={t("Call", "اتصال")}>
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M4 4h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2z" />
        </svg>
      </a>
      <a className="btn btn-wa" href={WA}>
        {t("WhatsApp", "واتساب")}
      </a>
      <button className="btn btn-ghost" onClick={() => nav("/shop")} style={{ background: "var(--card)" }}>
        {t("Shop", "تسوّقوا")}
      </button>
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const bare = loc.pathname.startsWith("/admin");
  if (bare) return <>{children}</>;
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <MobileBar />
    </>
  );
}

export { WA, TEL };
