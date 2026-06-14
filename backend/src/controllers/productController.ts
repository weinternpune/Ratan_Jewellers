import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { Product } from "../models/Product";
import { Category, GoldRate, Inventory } from "../models/index";
import { Review } from "../models/Invoice";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ─── helper: add `id` string field so frontend product.id works everywhere ─────
const withId = (p: any) => ({ ...p, id: p._id?.toString() ?? p.id });

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      page = "1",
      limit = "100", // frontend fetches all and filters client-side
      category,
      metal,
      purity,
      search,
      featured,
      trending,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(200, parseInt(limit as string));

    const filter: any = {};

    // ── category: accepts comma-separated names OR slugs OR ObjectIds ──────────
    if (category) {
      const categoryValues = (category as string)
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      const categoryIds = categoryValues.filter((v) =>
        Types.ObjectId.isValid(v),
      );
      const categorySlugs = categoryValues.map((v) => v.toLowerCase());

      const matchedCategories = await Category.find({
        isActive: true,
        $or: [
          { slug: { $in: categorySlugs } },
          {
            name: {
              $in: categoryValues.map(
                (v) => new RegExp(`^${escapeRegExp(v)}$`, "i"),
              ),
            },
          },
        ],
      })
        .select("_id")
        .lean();

      filter.categoryId = {
        $in: [...categoryIds, ...matchedCategories.map((c: any) => c._id)],
      };
    }

    // ── metal / purity: case-insensitive comma-separated ──────────────────────
    if (metal) {
      filter.metal = {
        $in: (metal as string)
          .split(",")
          .map((v) => new RegExp(`^${escapeRegExp(v.trim())}$`, "i")),
      };
    }

    if (purity) {
      filter.purity = {
        $in: (purity as string)
          .split(",")
          .map((v) => new RegExp(`^${escapeRegExp(v.trim())}$`, "i")),
      };
    }

    if (featured === "true") filter.isFeatured = true;
    if (trending === "true") filter.isTrending = true;

    if (search) {
      const q = escapeRegExp((search as string).trim());
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { sku: { $regex: q, $options: "i" } },
        { keywords: { $regex: q, $options: "i" } },
      ];
    }

    const sort: any = { [sortBy as string]: sortOrder === "asc" ? 1 : -1 };

    // ── gold rate ─────────────────────────────────────────────────────────────
    const latestGoldRate = await GoldRate.findOne().sort({ createdAt: -1 });
    const goldRate = latestGoldRate?.ratePerGram || 6500;

    // ── query ─────────────────────────────────────────────────────────────────
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("categoryId", "name slug")
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean<any[]>(),
      Product.countDocuments(filter),
    ]);

    // ── inventory map ─────────────────────────────────────────────────────────
    const inventories = await Inventory.find({
      productId: { $in: products.map((p: any) => p._id) },
    }).lean<any[]>();

    const invMap = Object.fromEntries(
      inventories.map((i: any) => [i.productId.toString(), i]),
    );

    // ── review map ────────────────────────────────────────────────────────────
    const reviews = await Review.find({
      productId: { $in: products.map((p: any) => p._id) },
      isApproved: true,
    }).lean<any[]>();

    const reviewMap: Record<string, any[]> = {};
    reviews.forEach((r: any) => {
      const k = r.productId.toString();
      if (!reviewMap[k]) reviewMap[k] = [];
      reviewMap[k].push(r);
    });

    // ── enrich + normalise ────────────────────────────────────────────────────
    const enriched = products.map((p: any) => {
      const inv = invMap[p._id.toString()];
      const revs = reviewMap[p._id.toString()] || [];

      const currentPrice = Math.round(
        p.netWeight * goldRate + p.makingCharges + p.stoneCharges,
      );

      // category: frontend accepts both string and { name } object
      const category =
        p.categoryId?.name ??
        (typeof p.category === "string"
          ? p.category
          : (p.category?.name ?? ""));

      return withId({
        ...p,
        currentPrice,
        goldRate,
        category,
        image: p.image || p.images?.[0] || "",
        avgRating: revs.length
          ? +(
              revs.reduce((a: number, r: any) => a + r.rating, 0) / revs.length
            ).toFixed(1)
          : (p.avgRating ?? 0),
        reviewCount: revs.length || p.reviewCount || 0,
        inStock: inv
          ? (inv.currentStock || 0) - (inv.reservedStock || 0) > 0
          : (p.inStock ?? true),
      });
    });

    // ── response — shape the frontend expects: { products: [...] } ────────────
    res.json({ products: enriched });
  } catch (err) {
    next(err);
  }
};

export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const raw: any = await Product.findOne({ slug: req.params.slug })
      .populate("categoryId")
      .lean();

    if (!raw) throw new AppError("Product not found", 404);

    const latestGoldRate = await GoldRate.findOne().sort({ createdAt: -1 });
    const goldRate = latestGoldRate?.ratePerGram || 6500;

    const currentPrice = Math.round(
      raw.netWeight * goldRate + raw.makingCharges + raw.stoneCharges,
    );

    const [inventory, reviews, relatedRaw] = await Promise.all([
      Inventory.findOne({ productId: raw._id }).lean(),
      Review.find({ productId: raw._id, isApproved: true }).limit(20).lean(),
      Product.find({
        categoryId: raw.categoryId,
        _id: { $ne: raw._id },
        isActive: true,
      })
        .limit(8)
        .lean<any[]>(),
    ]);

    const revs: any[] = reviews as any[];
    const avgRating = revs.length
      ? +(revs.reduce((a, r) => a + r.rating, 0) / revs.length).toFixed(1)
      : (raw.avgRating ?? 0);

    const category =
      raw.categoryId?.name ??
      (typeof raw.category === "string"
        ? raw.category
        : (raw.category?.name ?? ""));

    const related = (relatedRaw as any[]).map(withId);

    // ── response — shape the frontend expects: { product: {...} } ─────────────
    res.json({
      product: withId({
        ...raw,
        currentPrice,
        goldRate,
        category,
        image: raw.image || raw.images?.[0] || "",
        avgRating,
        reviewCount: revs.length || raw.reviewCount || 0,
       inStock:
  inventory
    ? (((inventory as any).currentStock || 0) -
        ((inventory as any).reservedStock || 0) > 0)
    : (raw.inStock ?? true),
        inventory,
        reviews,
        related,
      }),
    });
  } catch (err) {
    next(err);
  }
};

// ── createProduct, updateProduct, deleteProduct — unchanged ───────────────────

export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = req.body;

    if (!data.sku) {
      const count = await Product.countDocuments();
      data.sku = `RJ${String(count + 1).padStart(5, "0")}`;
    }

    data.slug =
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      data.sku.toLowerCase();

    const product = await Product.create(data);

    await Inventory.create({
      productId: product._id,
      currentStock: data.initialStock || 0,
    });

    res
      .status(201)
      .json({ success: true, message: "Product created", data: product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) throw new AppError("Product not found", 404);
    res.json({ success: true, message: "Product updated", data: product });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: "Product deactivated" });
  } catch (err) {
    next(err);
  }
};
