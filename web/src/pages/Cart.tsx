import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { useCart } from "../lib/cart";
import { api, type Product } from "../lib/api";
import { ApplianceArt } from "../components/Art";

export default function Cart() {
  const { t } = useI18n();
  const { items, setQty, remove } = useCart();
  const nav = useNavigate();
  const [all, setAll] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .products()
      .then(setAll)
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  }, []);

  const lines = items
    .map((i) => ({ item: i, p: all.find((x) => x.id === i.id) }))
    .filter((l): l is { item: typeof l.item; p: Product } => !!l.p);
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.item.qty, 0);

  return (
    <div className="wrap">
      <div className="sec-head" style={{ paddingTop: 26 }}>
        <h2>{t("Your cart", "سلّتكم")}</h2>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : lines.length === 0 ? (
        <div className="empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="9" cy="20" r="1.4" />
            <circle cx="18" cy="20" r="1.4" />
            <path d="M2 3h2.2l2.3 12.3a2 2 0 0 0 2 1.7h8.4a2 2 0 0 0 2-1.6L21 7H6" />
          </svg>
          <h3>{t("Your cart is empty", "سلّتكم فارغة")}</h3>
          <p style={{ margin: "8px 0 18px" }}>{t("Add a few appliances to get started.", "أضيفوا بعض الأجهزة لتبدأوا.")}</p>
          <button className="btn btn-primary" onClick={() => nav("/shop")}>
            {t("Start shopping", "ابدأوا التسوّق")}
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-lines">
            {lines.map(({ item, p }) => (
              <div className="cart-line" key={p.id}>
                <div className="ph">
                  <ApplianceArt slug={p.category?.slug || "small"} />
                </div>
                <div>
                  <span className="brand">{p.brand}</span>
                  <h3>{t(p.nameEn, p.nameAr)}</h3>
                  <div className="qty sm" style={{ marginTop: 8 }}>
                    <button onClick={() => setQty(p.id, item.qty - 1)}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => setQty(p.id, item.qty + 1)}>+</button>
                  </div>
                </div>
                <div>
                  <div className="lp">${p.price * item.qty}</div>
                  <button className="rm" onClick={() => remove(p.id)}>
                    {t("Remove", "إزالة")}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="summary">
            <h3>{t("Order summary", "ملخّص الطلب")}</h3>
            <div className="srow">
              <span>{t("Subtotal", "المجموع الفرعي")}</span>
              <span>${subtotal}</span>
            </div>
            <div className="srow">
              <span>{t("Delivery in Aley", "التوصيل في عاليه")}</span>
              <span className="free">{t("Free", "مجاني")}</span>
            </div>
            <div className="srow total">
              <span>{t("Total", "الإجمالي")}</span>
              <span>${subtotal}</span>
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={() => nav("/checkout")}>
              {t("Checkout", "إتمام الشراء")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
