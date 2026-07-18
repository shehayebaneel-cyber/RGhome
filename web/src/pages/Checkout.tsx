import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { useCart } from "../lib/cart";
import { api, type Product } from "../lib/api";

export default function Checkout() {
  const { t } = useI18n();
  const { items, clear } = useCart();
  const nav = useNavigate();
  const [all, setAll] = useState<Product[]>([]);
  const [method, setMethod] = useState<"COD" | "INSTORE">("COD");
  const [form, setForm] = useState({ customerName: "", phone: "", town: "", address: "", note: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.products().then(setAll).catch(() => {});
  }, []);
  useEffect(() => {
    if (items.length === 0) nav("/cart");
  }, [items.length, nav]);

  const lines = items.map((i) => ({ i, p: all.find((x) => x.id === i.id) })).filter((l) => l.p);
  const subtotal = lines.reduce((s, l) => s + (l.p!.price * l.i.qty), 0);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.customerName.trim().length < 2) return setError(t("Please enter your name.", "الرجاء إدخال اسمكم."));
    if (form.phone.trim().length < 6) return setError(t("Please enter a valid phone number.", "الرجاء إدخال رقم هاتف صحيح."));
    if (method === "COD" && form.address.trim().length < 3)
      return setError(t("Please enter a delivery address.", "الرجاء إدخال عنوان التوصيل."));
    setSubmitting(true);
    try {
      const res = await api.createOrder({
        ...form,
        paymentMethod: method,
        items: items.map((i) => ({ productId: i.id, qty: i.qty })),
      });
      clear();
      nav(`/order/${res.reference}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="wrap">
      <div className="sec-head" style={{ paddingTop: 26 }}>
        <h2>{t("Checkout", "إتمام الشراء")}</h2>
      </div>
      <div className="cart-layout">
        <form onSubmit={submit}>
          {error && <div className="notice err">{error}</div>}
          <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>{t("Your details", "معلوماتكم")}</h3>
          <div className="form-grid">
            <div className="field">
              <label>{t("Full name", "الاسم الكامل")}</label>
              <input value={form.customerName} onChange={(e) => set("customerName", e.target.value)} />
            </div>
            <div className="field">
              <label>{t("Phone / WhatsApp", "هاتف / واتساب")}</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} inputMode="tel" placeholder="70 000 000" />
            </div>
            <div className="field">
              <label>{t("Town", "البلدة")}</label>
              <input value={form.town} onChange={(e) => set("town", e.target.value)} placeholder={t("e.g. Aley", "مثال: عاليه")} />
            </div>
            <div className="field">
              <label>{t("Address", "العنوان")}</label>
              <input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder={t("Street, building…", "شارع، مبنى…")} />
            </div>
            <div className="field full">
              <label>{t("Note (optional)", "ملاحظة (اختياري)")}</label>
              <textarea rows={3} value={form.note} onChange={(e) => set("note", e.target.value)} placeholder={t("Any delivery details or questions.", "أي تفاصيل توصيل أو أسئلة.")} />
            </div>
          </div>

          <h3 style={{ color: "var(--navy)", margin: "10px 0 12px" }}>{t("Payment", "الدفع")}</h3>
          <div className="pay-opts">
            <label className={"pay-opt" + (method === "COD" ? " on" : "")}>
              <input type="radio" name="pay" checked={method === "COD"} onChange={() => setMethod("COD")} />
              <div>
                <div className="t">{t("Cash on delivery", "الدفع عند الاستلام")}</div>
                <div className="d">{t("Pay in cash when your order arrives. Free delivery within Aley.", "ادفعوا نقداً عند وصول الطلب. توصيل مجاني ضمن عاليه.")}</div>
              </div>
            </label>
            <label className={"pay-opt" + (method === "INSTORE" ? " on" : "")}>
              <input type="radio" name="pay" checked={method === "INSTORE"} onChange={() => setMethod("INSTORE")} />
              <div>
                <div className="t">{t("Reserve & pay in store", "احجزوا وادفعوا في المتجر")}</div>
                <div className="d">{t("We'll hold the item; pay and collect at the Old Souk showroom.", "نحجز لكم القطعة؛ ادفعوا واستلموا من صالة العرض في السوق القديم.")}</div>
              </div>
            </label>
          </div>
          <div className="callout" style={{ marginBottom: 16 }}>
            {t("Online card payment is coming soon. For now, choose cash on delivery or reserve in store.", "الدفع بالبطاقة أونلاين قريباً. حالياً اختاروا الدفع عند الاستلام أو الحجز في المتجر.")}
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? t("Placing order…", "جارٍ إرسال الطلب…") : t("Place order", "تأكيد الطلب")}
          </button>
        </form>

        <div className="summary">
          <h3>{t("Order summary", "ملخّص الطلب")}</h3>
          {lines.map(({ i, p }) => (
            <div className="srow" key={p!.id}>
              <span>
                {t(p!.nameEn, p!.nameAr)} × {i.qty}
              </span>
              <span>${p!.price * i.qty}</span>
            </div>
          ))}
          <div className="srow">
            <span>{t("Delivery in Aley", "التوصيل في عاليه")}</span>
            <span className="free">{t("Free", "مجاني")}</span>
          </div>
          <div className="srow total">
            <span>{t("Total", "الإجمالي")}</span>
            <span>${subtotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
