export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  image?: string;
  images: string[];
  metal: string;
  purity: string;
  netWeight: number;
  currentPrice: number;
  goldRate: number;
  makingCharges: number;
  stoneCharges: number;
  avgRating: number;
  reviewCount: number;
  inStock: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  createdAt?: string;
  category: string | { name: string };
  categoryId?: string | { name?: string; slug?: string };
}