import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { useCart } from "../lib/cart";
import { api, type Category, type Product } from "../lib/api";
import { CatIcon } from "../components/Art";
import ProductCard from "../components/ProductCard";
import { WA, TEL } from "../components/Layout";

export default function Home() {
  const { t } = useI18n();
  const { add } = useCart();
  const nav = useNavigate();
  const [cats, setCats] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    api.categories().then(setCats).catch(() => {});
    api.products({ featured: true }).then(setFeatured).catch(() => {});
  }, []);

  const ac = featured.find((p) => p.category?.slug === "ac") || featured[0];

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <p className="eyebrow">{t("Home appliances & electronics · Aley", "أجهزة منزلية وإلكترونيات · عاليه")}</p>
            <h1>{t("Your home, upgraded.", "جهّزوا منزلكم بأفضل ما يكون.")}</h1>
            <p className="lead">
              {t(
                "Aley's trusted showroom for home appliances & consumer electronics since 2020. Big brands, honest prices, real advice — delivered and installed at your door.",
                "صالة عرض أهل عاليه للأجهزة المنزلية والإلكترونيات منذ ٢٠٢٠. ماركات عالمية، أسعار صادقة، ونصيحة حقيقية — مع التوصيل والتركيب إلى باب منزلكم."
              )}
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary" onClick={() => nav("/shop")}>
                {t("Shop appliances", "تسوّقوا الأجهزة")}
              </button>
              {ac && (
                <button className="btn btn-ghost" onClick={() => nav(`/product/${ac.id}`)}>
                  {t("See this month's offer", "عرض هذا الشهر")}
                </button>
              )}
            </div>
            <div className="hero-trust">
              <span className="chip">
                <span className="stars">★★★★★</span> <b>4.9</b>&nbsp;{t("on Google", "على غوغل")}
              </span>
              <span className="chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {t("Trusted since 2020", "ثقة منذ ٢٠٢٠")}
              </span>
              <span className="chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                {t("Open 9 AM – 9 PM", "مفتوح ٩ ص – ٩ م")}
              </span>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <span className="badge-deal">{t("Winter offer", "عرض الشتاء")}</span>
            <svg className="appliance" viewBox="0 0 300 200" fill="none" stroke="currentColor">
              <rect x="24" y="34" width="252" height="82" rx="18" fill="var(--card)" strokeWidth="3" />
              <line x1="24" y1="86" x2="276" y2="86" strokeWidth="2.4" opacity=".5" />
              <path d="M40 100h150" strokeWidth="3" strokeLinecap="round" opacity=".45" />
              <rect x="214" y="94" width="46" height="12" rx="6" fill="var(--blue)" stroke="none" />
              <path d="M70 138c0 14 10 14 10 28M120 138c0 14 10 14 10 28M170 138c0 14 10 14 10 28" strokeWidth="3" strokeLinecap="round" opacity=".6" />
            </svg>
            <div className="pricetag">
              <span className="l">{t("Samsung 12,000 BTU Inverter AC", "مكيّف سامسونغ ١٢٠٠٠ وحدة، انفرتر")}</span>
              <span className="p">$468</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <p className="eyebrow">{t("Browse the store", "تصفّحوا المتجر")}</p>
              <h2>{t("Shop by category", "تسوّقوا حسب القسم")}</h2>
            </div>
            <a className="link" onClick={() => nav("/shop")}>
              {t("All products →", "كل المنتجات →")}
            </a>
          </div>
          <div className="cats">
            {cats.map((c) => (
              <div key={c.id} className="cat" onClick={() => nav(`/shop/${c.slug}`)}>
                <span className="ic">
                  <CatIcon slug={c.slug} />
                </span>
                <h3>{t(c.nameEn, c.nameAr)}</h3>
                <span>{t(`${c.count} products`, `${c.count} منتج`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {ac && (
        <section>
          <div className="wrap">
            <div className="offer">
              <div>
                <p className="eyebrow">{t("This month's offer", "عرض هذا الشهر")}</p>
                <h2>{t(ac.nameEn, ac.nameAr)}</h2>
                <p>
                  {t(
                    "A++ energy rating, R32 gas, Wi-Fi control and heating + cooling — the AC our neighbours keep coming back for. Delivery and installation across Aley included.",
                    "كفاءة A++، غاز R32، تحكّم واي-فاي، تدفئة وتبريد — المكيّف الذي يثق به أهل عاليه. التوصيل والتركيب ضمن عاليه مشمولان."
                  )}
                </p>
                <div className="specs">
                  {ac.tags.slice(0, 4).map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
              </div>
              <div className="offer-buy">
                {ac.wasPrice && <span className="was">${ac.wasPrice}</span>}
                <span className="now">${ac.price}</span>
                <button className="btn btn-primary" onClick={() => add(ac.id)}>
                  {t("Add to cart", "أضيفوا إلى السلة")}
                </button>
                <a className="btn btn-wa" href={WA}>
                  {t("Ask on WhatsApp", "اسألوا عبر واتساب")}
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <p className="eyebrow">{t("Fresh in store", "وصل حديثاً")}</p>
              <h2>{t("Popular right now", "الأكثر رواجاً الآن")}</h2>
            </div>
            <a className="link" onClick={() => nav("/shop")}>
              {t("See all →", "عرض الكل →")}
            </a>
          </div>
          <div className="prods">
            {featured.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <p className="eyebrow">{t("Why shop with us", "لماذا نحن")}</p>
              <h2>{t("A store that stands behind every sale", "متجر يقف خلف كل عملية بيع")}</h2>
            </div>
          </div>
          <div className="why">
            <Why icon={<><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" /><path d="M9 12l2 2 4-4" /></>}
              h={t("Honest advice", "نصيحة صادقة")}
              p={t("We help you pick what fits your home and budget — no pushy upselling.", "نساعدكم على اختيار ما يناسب منزلكم وميزانيتكم — بلا ضغط بيع.")} />
            <Why icon={<><rect x="1" y="6" width="14" height="10" rx="2" /><path d="M15 9h4l3 3v4h-7z" /><circle cx="6" cy="18" r="1.6" /><circle cx="18" cy="18" r="1.6" /></>}
              h={t("Delivery & installation", "توصيل وتركيب")}
              p={t("Fast delivery across Aley and Mount Lebanon, with professional setup.", "توصيل سريع في عاليه وجبل لبنان، مع تركيب احترافي.")} />
            <Why icon={<path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8z" />}
              h={t("Warranty on everything", "كفالة على كل شيء")}
              p={t("Every appliance comes with a manufacturer warranty and our after-sales support.", "كل جهاز مع كفالة الوكيل ودعم ما بعد البيع.")} />
            <Why icon={<><path d="M3 21V10l9-7 9 7v11" /><path d="M9 21v-6h6v6" /></>}
              h={t("Aley's own showroom", "صالة عرض أهل عاليه")}
              p={t("A real shop in the Old Souk you can walk into — 4.9★ from your neighbours.", "متجر حقيقي في السوق القديم تزورونه — تقييم ٤٫٩ من جيرانكم.")} />
          </div>
        </div>
      </section>

      <section id="visit">
        <div className="wrap">
          <div className="visit">
            <div className="visit-card">
              <p className="eyebrow">{t("Come say hello", "مرّوا علينا")}</p>
              <h2>{t("Visit us in Aley", "زورونا في عاليه")}</h2>
              <div className="contact-list">
                <div className="ci">
                  <span className="ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.4" /></svg>
                  </span>
                  <div>
                    <div className="l">{t("Address", "العنوان")}</div>
                    <div className="v">{t("Debbas Street, Old Souk, Aley, Lebanon", "شارع دبّاس، السوق القديم، عاليه، لبنان")}</div>
                  </div>
                </div>
                <a href={TEL}>
                  <span className="ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2z" /></svg>
                  </span>
                  <div>
                    <div className="l">{t("Call or WhatsApp", "اتصال أو واتساب")}</div>
                    <div className="v">05 556 970 · 70 556 970</div>
                  </div>
                </a>
                <a href="mailto:rghome.aley@hotmail.com">
                  <span className="ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                  </span>
                  <div>
                    <div className="l">{t("Email", "بريد إلكتروني")}</div>
                    <div className="v">rghome.aley@hotmail.com</div>
                  </div>
                </a>
                <div className="ci">
                  <span className="ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                  </span>
                  <div>
                    <div className="l">{t("Opening hours", "ساعات العمل")}</div>
                    <div className="v">{t("Every day · 9:00 AM – 9:00 PM", "كل يوم · ٩:٠٠ ص – ٩:٠٠ م")}</div>
                  </div>
                </div>
              </div>
              <div className="visit-cta">
                <a className="btn btn-primary" href={TEL}>
                  {t("Call the store", "اتصلوا بالمتجر")}
                </a>
                <a className="btn btn-wa" href={WA}>
                  {t("Chat on WhatsApp", "راسلونا واتساب")}
                </a>
              </div>
            </div>
            <div className="map" aria-label="Map">
              <div className="grid-lines" />
              <svg className="pin" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a7 7 0 0 0-7 7c0 4.8 7 13 7 13s7-8.2 7-13a7 7 0 0 0-7-7z" />
                <circle cx="12" cy="9" r="2.6" fill="#fff" />
              </svg>
              <div className="lbl">{t("RG Home · Old Souk, Aley", "آر جي هوم · السوق القديم، عاليه")}</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Why({ icon, h, p }: { icon: React.ReactNode; h: string; p: string }) {
  return (
    <div className="item">
      <span className="ic">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          {icon}
        </svg>
      </span>
      <h3>{h}</h3>
      <p>{p}</p>
    </div>
  );
}
