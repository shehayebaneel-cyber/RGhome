import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { api, type Category, type Product } from "../lib/api";
import ProductCard from "../components/ProductCard";

export default function Shop() {
  const { t } = useI18n();
  const { cat } = useParams();
  const nav = useNavigate();
  const active = cat || "all";
  const [cats, setCats] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("pop");

  useEffect(() => {
    api.categories().then(setCats).catch(() => {});
  }, []);
  useEffect(() => {
    setLoading(true);
    api
      .products({ category: active })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [active]);

  const sorted = [...products].sort((a, b) => {
    if (sort === "low") return a.price - b.price;
    if (sort === "high") return b.price - a.price;
    return 0;
  });

  const total = cats.reduce((s, c) => s + (c.count || 0), 0);

  return (
    <>
      <div className="shop-top">
        <div className="wrap">
          <h1>{t("Shop all appliances", "تسوّقوا كل الأجهزة")}</h1>
          <p>{t("Air conditioning, TVs, kitchen & laundry — with delivery across Aley.", "تكييف، تلفزيونات، مطبخ وغسيل — مع التوصيل في عاليه.")}</p>
        </div>
      </div>
      <div className="wrap shop-layout">
        <aside className="filters">
          <h4>{t("Categories", "الأقسام")}</h4>
          <div className="fcat">
            <button className={active === "all" ? "on" : ""} onClick={() => nav("/shop")}>
              {t("All products", "كل المنتجات")} <span>{total}</span>
            </button>
            {cats.map((c) => (
              <button key={c.id} className={active === c.slug ? "on" : ""} onClick={() => nav(`/shop/${c.slug}`)}>
                {t(c.nameEn, c.nameAr)} <span>{c.count}</span>
              </button>
            ))}
          </div>
        </aside>
        <div>
          <div className="shop-bar">
            <span className="count">{t(`${sorted.length} products`, `${sorted.length} منتج`)}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="pop">{t("Sort: Popular", "ترتيب: الأكثر رواجاً")}</option>
              <option value="low">{t("Price: Low to High", "السعر: من الأقل")}</option>
              <option value="high">{t("Price: High to Low", "السعر: من الأعلى")}</option>
            </select>
          </div>
          {loading ? (
            <div className="spinner" />
          ) : sorted.length === 0 ? (
            <div className="empty">
              <h3>{t("No products here yet", "لا منتجات هنا بعد")}</h3>
            </div>
          ) : (
            <div className="prods">
              {sorted.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
