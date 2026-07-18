import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { useCart } from "../lib/cart";
import { api, type Product as P } from "../lib/api";
import { ApplianceArt } from "../components/Art";
import ProductCard from "../components/ProductCard";
import { WA } from "../components/Layout";

export default function Product() {
  const { id } = useParams();
  const { t } = useI18n();
  const { add } = useCart();
  const nav = useNavigate();
  const [p, setP] = useState<P | null>(null);
  const [qty, setQty] = useState(1);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setP(null);
    setNotFound(false);
    setQty(1);
    window.scrollTo(0, 0);
    api
      .product(id!)
      .then(setP)
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound)
    return (
      <div className="wrap empty">
        <h3>{t("Product not found", "المنتج غير موجود")}</h3>
        <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => nav("/shop")}>
          {t("Back to shop", "العودة للمتجر")}
        </button>
      </div>
    );
  if (!p) return <div className="spinner" />;

  const slug = p.category?.slug || "small";
  const badge = t(p.badgeEn, p.badgeAr);

  return (
    <div className="wrap">
      <div className="pd">
        <div className="pd-media">
          {badge && <span className="tag">{badge}</span>}
          <ApplianceArt slug={slug} />
        </div>
        <div>
          <div className="crumbs">
            <a onClick={() => nav("/shop")}>{t("Shop", "المتجر")}</a> /{" "}
            <a onClick={() => nav(`/shop/${slug}`)}>{t(p.category?.nameEn || "", p.category?.nameAr || "")}</a>
          </div>
          <span className="pd-brand">{p.brand}</span>
          <h1>{t(p.nameEn, p.nameAr)}</h1>
          <div className="pd-price">
            ${p.price}
            {p.wasPrice && <s>${p.wasPrice}</s>}
          </div>
          <div className="pd-tags">
            {p.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <p className="pd-desc">{t(p.descEn, p.descAr)}</p>
          <div className="pd-buy">
            <div className="qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
            <button className="btn btn-primary" onClick={() => add(p.id, qty)}>
              {t("Add to cart", "أضيفوا إلى السلة")}
            </button>
            <a className="btn btn-wa" href={WA}>
              {t("Ask on WhatsApp", "اسألوا عبر واتساب")}
            </a>
          </div>
          <div className="pd-assure">
            <div>
              <Check /> {t("Delivery & installation in Aley", "توصيل وتركيب في عاليه")}
            </div>
            <div>
              <Check /> {t("Official manufacturer warranty", "كفالة الوكيل الرسمية")}
            </div>
            <div>
              <Check /> {t("Pay cash on delivery", "الدفع نقداً عند الاستلام")}
            </div>
          </div>
        </div>
      </div>

      {p.related && p.related.length > 0 && (
        <section style={{ paddingTop: 10 }}>
          <div className="sec-head">
            <h2 style={{ fontSize: 22 }}>{t("You might also like", "منتجات مشابهة")}</h2>
          </div>
          <div className="prods">
            {p.related.map((r) => (
              <ProductCard key={r.id} p={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
