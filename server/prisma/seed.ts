import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: "ac", nameEn: "Air Conditioners", nameAr: "مكيّفات", sortOrder: 1 },
  { slug: "tv", nameEn: "TVs & Screens", nameAr: "شاشات وتلفزيونات", sortOrder: 2 },
  { slug: "oven", nameEn: "Ovens & Cooking", nameAr: "أفران وطبخ", sortOrder: 3 },
  { slug: "fridge", nameEn: "Refrigeration", nameAr: "برّادات وتبريد", sortOrder: 4 },
  { slug: "wash", nameEn: "Washing & Laundry", nameAr: "غسّالات", sortOrder: 5 },
  { slug: "coffee", nameEn: "Coffee & Kitchen", nameAr: "قهوة ومطبخ", sortOrder: 6 },
  { slug: "small", nameEn: "Small Appliances", nameAr: "أجهزة صغيرة", sortOrder: 7 },
];

// Only the Samsung 12,000 BTU AC price is confirmed real; the rest are realistic placeholders.
const PRODUCTS = [
  { cat: "ac", brand: "Samsung", nameEn: "12,000 BTU Inverter AC", nameAr: "مكيّف ١٢٠٠٠ وحدة انفرتر", price: 468, wasPrice: 540, tags: "A++,Wi-Fi,Inverter,R32,Heat + Cool", badgeEn: "Best seller", badgeAr: "الأكثر مبيعاً", stock: 14, featured: true },
  { cat: "ac", brand: "LG", nameEn: "DualCool 18,000 BTU AC", nameAr: "مكيّف ديوال كوول ١٨٠٠٠", price: 610, tags: "A++,Inverter,Fast cooling", stock: 8 },
  { cat: "tv", brand: "LG", nameEn: '55" 4K UHD Smart TV', nameAr: "تلفزيون ذكي ٥٥ بوصة 4K", price: 399, badgeEn: "New", badgeAr: "جديد", tags: "4K,webOS,HDR10", stock: 6, featured: true },
  { cat: "tv", brand: "Samsung", nameEn: '65" QLED 4K TV', nameAr: "تلفزيون QLED ٦٥ بوصة", price: 720, tags: "QLED,4K,Smart Hub", stock: 4 },
  { cat: "oven", brand: "Ariston", nameEn: "Built-in Oven 60cm", nameAr: "فرن مدمج ٦٠ سم", price: 340, tags: "Multifunction,60 L,Grill", stock: 7 },
  { cat: "oven", brand: "Bosch", nameEn: "Gas Cooker 5-Burner", nameAr: "طبّاخة غاز ٥ عيون", price: 410, tags: "5 burners,Auto-ignite,Cast iron", stock: 9 },
  { cat: "fridge", brand: "Samsung", nameEn: "No-Frost Fridge 500L", nameAr: "برّاد نو-فروست ٥٠٠ ل", price: 650, tags: "No-Frost,500 L,Inverter", stock: 5 },
  { cat: "fridge", brand: "LG", nameEn: "Side-by-Side Fridge", nameAr: "برّاد بابين", price: 980, wasPrice: 1090, badgeEn: "−10%", badgeAr: "−١٠٪", tags: "Side-by-side,Water dispenser", stock: 3 },
  { cat: "wash", brand: "Bosch", nameEn: "8 kg Washing Machine", nameAr: "غسّالة ٨ كغ", price: 520, tags: "8 kg,1400 rpm,EcoSilence", stock: 6 },
  { cat: "wash", brand: "Samsung", nameEn: "9 kg Front-Load Washer", nameAr: "غسّالة أمامية ٩ كغ", price: 560, tags: "9 kg,EcoBubble,Steam", stock: 5 },
  { cat: "coffee", brand: "De'Longhi", nameEn: "Filter Coffee Maker", nameAr: "ماكينة قهوة فلتر", price: 79, tags: "1.25 L,Keep-warm,Anti-drip", stock: 2 },
  { cat: "coffee", brand: "Nespresso", nameEn: "Capsule Coffee Machine", nameAr: "ماكينة قهوة كبسولات", price: 145, badgeEn: "New", badgeAr: "جديد", tags: "19 bar,Fast heat-up", stock: 11, featured: true },
  { cat: "small", brand: "Philips", nameEn: "Air Fryer XL 6.2L", nameAr: "قلّاية هوائية ٦٫٢ ل", price: 130, wasPrice: 155, badgeEn: "−15%", badgeAr: "−١٥٪", tags: "6.2 L,Rapid Air,Digital", stock: 10, featured: true },
  { cat: "small", brand: "Kenwood", nameEn: "Hand Blender Set", nameAr: "خلاط يدوي", price: 45, tags: "1000 W,Stainless,3-in-1", stock: 15 },
];

async function main() {
  console.log("Seeding RG Home database…");

  const catMap: Record<string, number> = {};
  for (const c of CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { nameEn: c.nameEn, nameAr: c.nameAr, sortOrder: c.sortOrder },
      create: c,
    });
    catMap[c.slug] = cat.id;
  }
  console.log(`  ${CATEGORIES.length} categories ready.`);

  let n = 0;
  for (const p of PRODUCTS) {
    const descEn = `${p.brand} ${p.nameEn} — available now at RG Home Aley, with delivery and installation across Aley & Mount Lebanon and full manufacturer warranty.`;
    const descAr = `${p.nameAr} من ${p.brand} — متوفّر الآن في آر جي هوم عاليه، مع التوصيل والتركيب في عاليه وجبل لبنان وكفالة الوكيل.`;
    // Deterministic-ish upsert by (brand+nameEn) via findFirst to avoid duplicates on re-seed.
    const existing = await prisma.product.findFirst({ where: { brand: p.brand, nameEn: p.nameEn } });
    const data = {
      categoryId: catMap[p.cat],
      brand: p.brand,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      descEn,
      descAr,
      price: p.price,
      wasPrice: p.wasPrice ?? null,
      tags: p.tags,
      badgeEn: p.badgeEn ?? "",
      badgeAr: p.badgeAr ?? "",
      stock: p.stock,
      isFeatured: p.featured ?? false,
      sortOrder: n,
    };
    if (existing) await prisma.product.update({ where: { id: existing.id }, data });
    else await prisma.product.create({ data });
    n++;
  }
  console.log(`  ${PRODUCTS.length} products ready.`);

  const email = process.env.ADMIN_EMAIL || "rghome.aley@hotmail.com";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: "Ghassan Rachid" },
  });
  console.log(`  Admin user ready: ${email}`);

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
