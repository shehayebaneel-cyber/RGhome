import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { api, type AdminStats, type Product, type Order, type Category } from "../lib/api";
import { Logo } from "../components/Art";

type Tab = "dashboard" | "products" | "orders";

export default function Admin() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [me, setMe] = useState<{ name: string; email: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");

  useEffect(() => {
    api
      .me()
      .then((u) => {
        setMe(u);
        setAuthChecked(true);
      })
      .catch(() => nav("/admin/login"));
  }, [nav]);

  if (!authChecked) return <div className="spinner" />;

  async function logout() {
    await api.logout().catch(() => {});
    nav("/admin/login");
  }

  return (
    <div className="admin">
      <aside className="aside">
        <div className="brand">
          <Logo light />
          <span>
            RG HOME<small>ADMIN</small>
          </span>
        </div>
        <button className={"navlink" + (tab === "dashboard" ? " on" : "")} onClick={() => setTab("dashboard")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
          {t("Dashboard", "اللوحة")}
        </button>
        <button className={"navlink" + (tab === "products" ? " on" : "")} onClick={() => setTab("products")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M3 7h18M3 12h18M3 17h18" /></svg>
          {t("Products", "المنتجات")}
        </button>
        <button className={"navlink" + (tab === "orders" ? " on" : "")} onClick={() => setTab("orders")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18M16 10a4 4 0 0 1-8 0" /></svg>
          {t("Orders", "الطلبات")}
        </button>
        <div className="spacer" />
        <button className="navlink" onClick={() => nav("/")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M3 12l9-9 9 9M5 10v10h14V10" /></svg>
          {t("View store", "عرض المتجر")}
        </button>
        <button className="navlink" onClick={logout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /></svg>
          {t("Sign out", "تسجيل الخروج")}
        </button>
      </aside>
      <main className="amain">
        {tab === "dashboard" && <Dashboard name={me?.name || ""} onManage={() => setTab("products")} />}
        {tab === "products" && <Products />}
        {tab === "orders" && <Orders />}
      </main>
    </div>
  );
}

function Dashboard({ name, onManage }: { name: string; onManage: () => void }) {
  const { t } = useI18n();
  const [s, setS] = useState<AdminStats | null>(null);
  useEffect(() => {
    api.stats().then(setS).catch(() => {});
  }, []);
  if (!s) return <div className="spinner" />;
  return (
    <>
      <div className="ahead">
        <div>
          <h1>{t(`Welcome back, ${name.split(" ")[0] || "there"}`, `أهلاً بعودتك، ${name.split(" ")[0] || ""}`)}</h1>
          <p>{t("Here's how RG Home is doing.", "إليك أداء آر جي هوم.")}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onManage}>
          {t("+ Add product", "+ إضافة منتج")}
        </button>
      </div>
      <div className="stats">
        <Stat label={t("Total orders", "إجمالي الطلبات")} n={String(s.orders)} />
        <Stat label={t("Revenue", "الإيرادات")} n={"$" + s.revenue.toLocaleString()} />
        <Stat label={t("Products live", "منتجات معروضة")} n={String(s.products)} />
        <Stat label={t("Low stock", "مخزون منخفض")} n={String(s.lowStock)} />
      </div>
      <div className="panel">
        <div className="ph">
          <h3>{t("Recent orders", "أحدث الطلبات")}</h3>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{t("Order", "طلب")}</th>
                <th>{t("Customer", "الزبون")}</th>
                <th>{t("Items", "أصناف")}</th>
                <th className="tnum">{t("Total", "المجموع")}</th>
                <th>{t("Status", "الحالة")}</th>
              </tr>
            </thead>
            <tbody>
              {s.recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">
                    {t("No orders yet.", "لا طلبات بعد.")}
                  </td>
                </tr>
              ) : (
                s.recent.map((o) => (
                  <tr key={o.reference}>
                    <td>{o.reference}</td>
                    <td>
                      {o.customerName}
                      <div className="muted">{o.town}</div>
                    </td>
                    <td>
                      {o.firstItem}
                      {o.items > 1 ? ` +${o.items - 1}` : ""}
                    </td>
                    <td className="tnum">${o.total}</td>
                    <td>
                      <span className={"pill " + o.status}>{o.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Stat({ label, n }: { label: string; n: string }) {
  return (
    <div className="stat">
      <div className="l">{label}</div>
      <div className="n">{n}</div>
    </div>
  );
}

const EMPTY = {
  categoryId: 1,
  brand: "",
  nameEn: "",
  nameAr: "",
  descEn: "",
  descAr: "",
  price: 0,
  wasPrice: null as number | null,
  tags: "",
  badgeEn: "",
  badgeAr: "",
  stock: 0,
  isActive: true,
  isFeatured: false,
};

function Products() {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [editing, setEditing] = useState<null | (typeof EMPTY & { id?: number })>(null);
  const [err, setErr] = useState("");

  const load = () => api.adminProducts().then(setProducts).catch(() => {});
  useEffect(() => {
    load();
    api.categories().then(setCats).catch(() => {});
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setErr("");
    const body = {
      ...editing,
      price: Number(editing.price),
      stock: Number(editing.stock),
      wasPrice: editing.wasPrice ? Number(editing.wasPrice) : null,
      categoryId: Number(editing.categoryId),
      tags: Array.isArray(editing.tags) ? (editing.tags as string[]).join(",") : editing.tags,
    };
    try {
      if (editing.id) await api.updateProduct(editing.id, body);
      else await api.createProduct(body);
      setEditing(null);
      load();
    } catch (e2) {
      setErr((e2 as Error).message);
    }
  }

  async function del(id: number) {
    if (!confirm(t("Hide this product from the store?", "إخفاء هذا المنتج من المتجر؟"))) return;
    await api.deleteProduct(id).catch(() => {});
    load();
  }

  function edit(p: Product) {
    setEditing({
      id: p.id,
      categoryId: p.categoryId,
      brand: p.brand,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      descEn: p.descEn,
      descAr: p.descAr,
      price: p.price,
      wasPrice: p.wasPrice,
      tags: p.tags.join(","),
      badgeEn: p.badgeEn,
      badgeAr: p.badgeAr,
      stock: p.stock,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
    });
  }

  const f = (k: keyof typeof EMPTY, v: unknown) => setEditing((e) => (e ? { ...e, [k]: v } : e));

  return (
    <>
      <div className="ahead">
        <div>
          <h1>{t("Products", "المنتجات")}</h1>
          <p>{t("Add, edit, or hide what appears in the store.", "أضيفوا أو عدّلوا أو أخفوا ما يظهر في المتجر.")}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing({ ...EMPTY, categoryId: cats[0]?.id || 1 })}>
          {t("+ Add product", "+ إضافة منتج")}
        </button>
      </div>

      {editing && (
        <div className="panel">
          <div className="ph">
            <h3>{editing.id ? t("Edit product", "تعديل منتج") : t("New product", "منتج جديد")}</h3>
          </div>
          {err && <div className="notice err" style={{ margin: "14px 18px 0" }}>{err}</div>}
          <form className="admin-form" onSubmit={save}>
            <div className="field">
              <label>{t("Category", "القسم")}</label>
              <select value={editing.categoryId} onChange={(e) => f("categoryId", Number(e.target.value))}>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {t(c.nameEn, c.nameAr)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>{t("Brand", "الماركة")}</label>
              <input value={editing.brand} onChange={(e) => f("brand", e.target.value)} required />
            </div>
            <div className="field">
              <label>{t("Name (English)", "الاسم (إنكليزي)")}</label>
              <input value={editing.nameEn} onChange={(e) => f("nameEn", e.target.value)} required />
            </div>
            <div className="field">
              <label>{t("Name (Arabic)", "الاسم (عربي)")}</label>
              <input value={editing.nameAr} onChange={(e) => f("nameAr", e.target.value)} dir="rtl" required />
            </div>
            <div className="field">
              <label>{t("Price ($)", "السعر ($)")}</label>
              <input type="number" value={editing.price} onChange={(e) => f("price", e.target.value)} required />
            </div>
            <div className="field">
              <label>{t("Was price ($, optional)", "السعر السابق ($، اختياري)")}</label>
              <input type="number" value={editing.wasPrice ?? ""} onChange={(e) => f("wasPrice", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div className="field">
              <label>{t("Stock", "المخزون")}</label>
              <input type="number" value={editing.stock} onChange={(e) => f("stock", e.target.value)} />
            </div>
            <div className="field">
              <label>{t("Spec tags (comma separated)", "المواصفات (مفصولة بفواصل)")}</label>
              <input value={editing.tags as string} onChange={(e) => f("tags", e.target.value)} placeholder="A++, Wi-Fi, Inverter" />
            </div>
            <div className="field">
              <label>{t("Badge EN (optional)", "شارة إنكليزي (اختياري)")}</label>
              <input value={editing.badgeEn} onChange={(e) => f("badgeEn", e.target.value)} placeholder="Best seller" />
            </div>
            <div className="field">
              <label>{t("Badge AR (optional)", "شارة عربي (اختياري)")}</label>
              <input value={editing.badgeAr} onChange={(e) => f("badgeAr", e.target.value)} dir="rtl" />
            </div>
            <div className="field full" style={{ display: "flex", gap: 20 }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                <input type="checkbox" style={{ width: "auto" }} checked={editing.isFeatured} onChange={(e) => f("isFeatured", e.target.checked)} />
                {t("Show on homepage", "عرض في الصفحة الرئيسية")}
              </label>
              <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                <input type="checkbox" style={{ width: "auto" }} checked={editing.isActive} onChange={(e) => f("isActive", e.target.checked)} />
                {t("Active (visible in store)", "مفعّل (ظاهر في المتجر)")}
              </label>
            </div>
            <div className="field full" style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" type="submit">
                {t("Save", "حفظ")}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => setEditing(null)}>
                {t("Cancel", "إلغاء")}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{t("Product", "المنتج")}</th>
                <th>{t("Category", "القسم")}</th>
                <th className="tnum">{t("Price", "السعر")}</th>
                <th className="tnum">{t("Stock", "المخزون")}</th>
                <th>{t("Status", "الحالة")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.brand} {p.nameEn}
                  </td>
                  <td className="muted">{t(p.category?.nameEn || "", p.category?.nameAr || "")}</td>
                  <td className="tnum">${p.price}</td>
                  <td className="tnum">{p.stock}</td>
                  <td>
                    <span className={"pill " + (!p.isActive ? "CANCELLED" : p.stock <= 3 ? "low" : "live")}>
                      {!p.isActive ? t("Hidden", "مخفي") : p.stock <= 3 ? t("Low", "منخفض") : t("Live", "معروض")}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: 6 }}>
                    <button className="icon-act" onClick={() => edit(p)}>
                      {t("Edit", "تعديل")}
                    </button>
                    <button className="icon-act danger" onClick={() => del(p.id)}>
                      {t("Hide", "إخفاء")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Orders() {
  const { t } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const load = () => api.adminOrders().then(setOrders).catch(() => {});
  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: number, status: string) {
    await api.setOrderStatus(id, status).catch(() => {});
    load();
  }

  return (
    <>
      <div className="ahead">
        <div>
          <h1>{t("Orders", "الطلبات")}</h1>
          <p>{t("Every order placed on the site.", "كل طلب يُقدَّم عبر الموقع.")}</p>
        </div>
      </div>
      <div className="panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{t("Order", "طلب")}</th>
                <th>{t("Customer", "الزبون")}</th>
                <th>{t("Items", "أصناف")}</th>
                <th className="tnum">{t("Total", "المجموع")}</th>
                <th>{t("Payment", "الدفع")}</th>
                <th>{t("Status", "الحالة")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted">
                    {t("No orders yet.", "لا طلبات بعد.")}
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.reference}</td>
                    <td>
                      {o.customerName}
                      <div className="muted">
                        {o.phone} · {o.town}
                      </div>
                    </td>
                    <td className="muted">
                      {o.items.map((i) => `${i.nameEn} ×${i.qty}`).join(", ")}
                    </td>
                    <td className="tnum">${o.total}</td>
                    <td className="muted">{o.paymentMethod === "COD" ? t("Cash on delivery", "عند الاستلام") : t("In store", "في المتجر")}</td>
                    <td>
                      <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--card)", color: "var(--ink)", fontWeight: 700, fontSize: 13 }}>
                        <option value="PENDING">{t("Pending", "قيد الانتظار")}</option>
                        <option value="CONFIRMED">{t("Confirmed", "مؤكّد")}</option>
                        <option value="DELIVERED">{t("Delivered", "تم التسليم")}</option>
                        <option value="CANCELLED">{t("Cancelled", "ملغى")}</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
