import { useNavigate } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { useCart } from "../lib/cart";
import { ApplianceArt } from "./Art";
import type { Product } from "../lib/api";

export default function ProductCard({ p }: { p: Product }) {
  const { t } = useI18n();
  const { add } = useCart();
  const nav = useNavigate();
  const slug = p.category?.slug || "small";
  const badge = t(p.badgeEn, p.badgeAr);

  return (
    <div className="prod" onClick={() => nav(`/product/${p.id}`)}>
      <div className="ph">
        {badge && <span className="tag">{badge}</span>}
        <ApplianceArt slug={slug} />
      </div>
      <div className="body">
        <span className="brand">{p.brand}</span>
        <h3>{t(p.nameEn, p.nameAr)}</h3>
        <span className="price">
          ${p.price}
          {p.wasPrice && <s>${p.wasPrice}</s>}
        </span>
        <button
          className="btn btn-primary btn-sm add"
          onClick={(e) => {
            e.stopPropagation();
            add(p.id);
          }}
        >
          {t("Add to cart", "أضيفوا للسلة")}
        </button>
      </div>
    </div>
  );
}
