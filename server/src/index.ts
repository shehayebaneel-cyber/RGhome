import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT) || 4010;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const WEB_URL = process.env.WEB_URL || "http://localhost:5173";

app.use(express.json());
app.use(cookieParser());
// WEB_URL may arrive as a bare hostname (Render fromService) or full origin(s).
const allowedOrigins = WEB_URL.split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => (/^https?:\/\//.test(s) ? s : "https://" + s));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ---------- helpers ----------
function ref() {
  return "RG" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1000);
}
function signToken(id: number) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
}
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.rg_admin || req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Not signed in." });
  try {
    (req as any).adminId = (jwt.verify(token, JWT_SECRET) as { id: number }).id;
    next();
  } catch {
    return res.status(401).json({ error: "Session expired. Please sign in again." });
  }
}
function serializeProduct(p: any) {
  return { ...p, tags: p.tags ? String(p.tags).split(",").map((t: string) => t.trim()).filter(Boolean) : [] };
}

// ---------- health ----------
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, salon: "RG Home Aley" });
  } catch {
    res.status(500).json({ ok: false });
  }
});

// ---------- categories ----------
app.get("/api/categories", async (_req, res) => {
  const cats = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
  res.json(cats.map((c) => ({ id: c.id, slug: c.slug, nameEn: c.nameEn, nameAr: c.nameAr, count: c._count.products })));
});

// ---------- products ----------
app.get("/api/products", async (req, res) => {
  const cat = typeof req.query.category === "string" ? req.query.category : undefined;
  const featured = req.query.featured === "1";
  const where: any = { isActive: true };
  if (cat && cat !== "all") where.category = { slug: cat };
  if (featured) where.isFeatured = true;
  const products = await prisma.product.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { category: true },
  });
  res.json(products.map(serializeProduct));
});

app.get("/api/products/:id", async (req, res) => {
  const p = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
    include: { category: true },
  });
  if (!p || !p.isActive) return res.status(404).json({ error: "Product not found." });
  const related = await prisma.product.findMany({
    where: { categoryId: p.categoryId, id: { not: p.id }, isActive: true },
    take: 4,
    orderBy: { sortOrder: "asc" },
    include: { category: true },
  });
  res.json({ ...serializeProduct(p), related: related.map(serializeProduct) });
});

// ---------- orders (Cash on Delivery / reserve in store) ----------
const orderSchema = z.object({
  customerName: z.string().min(2).max(80),
  phone: z.string().min(6).max(30),
  address: z.string().max(200).default(""),
  town: z.string().max(80).default(""),
  note: z.string().max(400).default(""),
  paymentMethod: z.enum(["COD", "INSTORE"]).default("COD"),
  items: z.array(z.object({ productId: z.number().int(), qty: z.number().int().min(1).max(50) })).min(1),
});

app.post("/api/orders", async (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please check your details and try again." });
  const body = parsed.data;

  const ids = body.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: ids }, isActive: true } });
  if (!products.length) return res.status(400).json({ error: "Your cart items are no longer available." });

  let subtotal = 0;
  const itemsData = body.items
    .map((i) => {
      const p = products.find((x) => x.id === i.productId);
      if (!p) return null;
      subtotal += p.price * i.qty;
      return { productId: p.id, nameEn: p.nameEn, nameAr: p.nameAr, brand: p.brand, price: p.price, qty: i.qty };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const deliveryFee = 0; // free within Aley
  const order = await prisma.order.create({
    data: {
      reference: ref(),
      customerName: body.customerName,
      phone: body.phone,
      address: body.address,
      town: body.town,
      note: body.note,
      paymentMethod: body.paymentMethod,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      items: { create: itemsData },
    },
  });
  res.json({ ok: true, reference: order.reference, total: order.total });
});

// ---------- admin auth ----------
app.post("/api/admin/login", async (req, res) => {
  const email = String(req.body?.email || "").toLowerCase().trim();
  const password = String(req.body?.password || "");
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Wrong email or password." });
  }
  const token = signToken(user.id);
  const prod = process.env.NODE_ENV === "production";
  res.cookie("rg_admin", token, {
    httpOnly: true,
    sameSite: prod ? "none" : "lax", // web & API are separate origins in production
    secure: prod,
    maxAge: 7 * 24 * 3600 * 1000,
  });
  res.json({ ok: true, name: user.name, email: user.email });
});

app.post("/api/admin/logout", (_req, res) => {
  const prod = process.env.NODE_ENV === "production";
  res.clearCookie("rg_admin", { sameSite: prod ? "none" : "lax", secure: prod });
  res.json({ ok: true });
});

app.get("/api/admin/me", requireAdmin, async (req, res) => {
  const user = await prisma.adminUser.findUnique({ where: { id: (req as any).adminId } });
  if (!user) return res.status(401).json({ error: "Not found." });
  res.json({ name: user.name, email: user.email });
});

// ---------- admin dashboard data ----------
app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
  const [orders, revenue, products, lowStock, recent] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true, stock: { lte: 3 } } }),
    prisma.order.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: { items: true } }),
  ]);
  res.json({
    orders,
    revenue: revenue._sum.total || 0,
    products,
    lowStock,
    recent: recent.map((o) => ({
      reference: o.reference,
      customerName: o.customerName,
      town: o.town,
      total: o.total,
      status: o.status,
      items: o.items.length,
      firstItem: o.items[0]?.nameEn || "",
      createdAt: o.createdAt,
    })),
  });
});

// ---------- admin products CRUD ----------
app.get("/api/admin/products", requireAdmin, async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { sortOrder: "asc" }, include: { category: true } });
  res.json(products.map(serializeProduct));
});

const productInput = z.object({
  categoryId: z.number().int(),
  brand: z.string().min(1).max(60),
  nameEn: z.string().min(1).max(120),
  nameAr: z.string().min(1).max(120),
  descEn: z.string().max(600).default(""),
  descAr: z.string().max(600).default(""),
  price: z.number().int().min(0),
  wasPrice: z.number().int().min(0).nullable().optional(),
  tags: z.string().max(300).default(""),
  badgeEn: z.string().max(40).default(""),
  badgeAr: z.string().max(40).default(""),
  stock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

app.post("/api/admin/products", requireAdmin, async (req, res) => {
  const parsed = productInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please fill in all required fields." });
  const p = await prisma.product.create({ data: parsed.data });
  res.json(serializeProduct(p));
});

app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
  const parsed = productInput.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid product data." });
  const p = await prisma.product.update({ where: { id: Number(req.params.id) }, data: parsed.data });
  res.json(serializeProduct(p));
});

app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
  await prisma.product.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
  res.json({ ok: true });
});

// ---------- admin orders ----------
app.get("/api/admin/orders", requireAdmin, async (_req, res) => {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true } });
  res.json(orders);
});

app.patch("/api/admin/orders/:id", requireAdmin, async (req, res) => {
  const status = String(req.body?.status || "");
  if (!["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"].includes(status))
    return res.status(400).json({ error: "Invalid status." });
  const o = await prisma.order.update({ where: { id: Number(req.params.id) }, data: { status } });
  res.json(o);
});

app.listen(PORT, () => console.log(`RG Home API running on http://localhost:${PORT}`));
