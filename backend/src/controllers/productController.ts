import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { GoldRate, Inventory } from '../models/index';
import { Review } from '../models/Invoice';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = '1',
      limit = '12',
      category,
      metal,
      purity,
      search,
      featured,
      trending,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const filter: any = {
      isActive: true,
    };

    if (category) {
      filter.categoryId = category;
    }

    if (metal) {
      filter.metal = {
        $in: (metal as string).split(','),
      };
    }

    if (purity) {
      filter.purity = {
        $in: (purity as string).split(','),
      };
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (trending === 'true') {
      filter.isTrending = true;
    }

    if (search) {
      filter.$text = {
        $search: search as string,
      };
    }

    const sort: any = {
      [sortBy as string]: sortOrder === 'asc' ? 1 : -1,
    };

    const latestGoldRate = await GoldRate.findOne().sort({
      createdAt: -1,
    });

    const goldRate = latestGoldRate?.ratePerGram || 6500;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('categoryId', 'name slug')
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean<any[]>(),

      Product.countDocuments(filter),
    ]);

    const inventories = await Inventory.find({
      productId: {
        $in: products.map((p: any) => p._id),
      },
    }).lean<any[]>();

    const invMap = Object.fromEntries(
      inventories.map((i: any) => [
        i.productId.toString(),
        i,
      ])
    );

    const reviews = await Review.find({
      productId: {
        $in: products.map((p: any) => p._id),
      },
      isApproved: true,
    }).lean<any[]>();

    const reviewMap: Record<string, any[]> = {};

    reviews.forEach((r: any) => {
      const k = r.productId.toString();

      if (!reviewMap[k]) {
        reviewMap[k] = [];
      }

      reviewMap[k].push(r);
    });

    const enriched = products.map((p: any) => {
      const inv = invMap[p._id.toString()];

      const revs = reviewMap[p._id.toString()] || [];

      const price =
        p.netWeight * goldRate +
        p.makingCharges +
        p.stoneCharges;

      return {
        ...p,

        currentPrice: Math.round(price),

        goldRate,

        avgRating: revs.length
          ? revs.reduce(
              (a: number, r: any) => a + r.rating,
              0
            ) / revs.length
          : 0,

        reviewCount: revs.length,

        inStock:
          ((inv?.currentStock || 0) -
            (inv?.reservedStock || 0)) > 0,
      };
    });

    res.json({
      success: true,

      data: {
        products: enriched,

        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product: any = await Product.findOne({
      slug: req.params.slug,
    })
      .populate('categoryId')
      .lean();

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const latestGoldRate = await GoldRate.findOne().sort({
      createdAt: -1,
    });

    const goldRate = latestGoldRate?.ratePerGram || 6500;

    const currentPrice = Math.round(
      product.netWeight * goldRate +
        product.makingCharges +
        product.stoneCharges
    );

    const [inventory, reviews, related] =
      await Promise.all([
        Inventory.findOne({
          productId: product._id,
        }),

        Review.find({
          productId: product._id,
          isApproved: true,
        }).limit(20),

        Product.find({
          categoryId: product.categoryId,
          _id: { $ne: product._id },
          isActive: true,
        })
          .limit(8)
          .lean<any[]>(),
      ]);

    res.json({
      success: true,

      data: {
        ...product,
        currentPrice,
        goldRate,
        inventory,
        reviews,
        related,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;

    if (!data.sku) {
      const count = await Product.countDocuments();

      data.sku = `RJ${String(count + 1).padStart(
        5,
        '0'
      )}`;
    }

    data.slug =
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      data.sku.toLowerCase();

    const product = await Product.create(data);

    await Inventory.create({
      productId: product._id,
      currentStock: data.initialStock || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Product created',
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({
      success: true,
      message: 'Product updated',
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, {
      isActive: false,
    });

    res.json({
      success: true,
      message: 'Product deactivated',
    });
  } catch (err) {
    next(err);
  }
};