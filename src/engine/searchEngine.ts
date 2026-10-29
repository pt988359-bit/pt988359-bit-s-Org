import { Product, ProductCondition, ProductStatus } from '../types';

export interface ProductSearchFilters {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  condition?: 'all' | ProductCondition;
  status?: 'all' | ProductStatus;
  isNegotiable?: boolean;
  hasWarranty?: boolean;
  minConditionRating?: number;
  minHealthScore?: number;
  tags?: string[];
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'health_score' | 'discount';
}

/**
 * FULL-TEXT SEARCH & MULTI-FACETED FILTER ENGINE
 */
export function searchProducts(products: Product[], filters: ProductSearchFilters): Product[] {
  const queryLower = filters.query ? filters.query.trim().toLowerCase() : '';

  let results = products.filter((item) => {
    // 1. Text Search across ALL searchable fields
    if (queryLower) {
      const matchTitle = item.title.toLowerCase().includes(queryLower);
      const matchBrand = item.brand.toLowerCase().includes(queryLower);
      const matchModel = item.model ? item.model.toLowerCase().includes(queryLower) : false;
      const matchDesc = item.description.toLowerCase().includes(queryLower);
      const matchBarcode = item.barcode ? item.barcode.includes(queryLower) : false;
      const matchQr = item.qrCode ? item.qrCode.includes(queryLower) : false;
      const matchLocation = item.showroomLocation ? item.showroomLocation.toLowerCase().includes(queryLower) : false;
      const matchShortName = item.shortName ? item.shortName.toLowerCase().includes(queryLower) : false;
      
      const matchTags = item.tags ? item.tags.some((t) => t.toLowerCase().includes(queryLower)) : false;

      const matchSpecs = item.specs ? item.specs.some(
        (s) => s.label.toLowerCase().includes(queryLower) || s.value.toLowerCase().includes(queryLower)
      ) : false;

      if (!matchTitle && !matchBrand && !matchModel && !matchDesc && !matchBarcode && !matchQr && !matchLocation && !matchShortName && !matchTags && !matchSpecs) {
        return false;
      }
    }

    // 2. Category Filter
    if (filters.categoryId && filters.categoryId !== 'all' && item.categoryId !== filters.categoryId) {
      return false;
    }

    // 3. Price Range
    if (filters.minPrice !== undefined && item.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && item.price > filters.maxPrice) return false;

    // 4. Brands Filter (Multi-brand)
    if (filters.brands && filters.brands.length > 0) {
      const matchesBrand = filters.brands.some((b) => b.toLowerCase() === item.brand.toLowerCase());
      if (!matchesBrand) return false;
    }

    // 5. Condition Filter
    if (filters.condition && filters.condition !== 'all' && item.condition !== filters.condition) {
      return false;
    }

    // 6. Status Filter
    if (filters.status && filters.status !== 'all' && item.status !== filters.status) {
      return false;
    }

    // 7. Negotiable Flag
    if (filters.isNegotiable !== undefined && item.isNegotiable !== filters.isNegotiable) {
      return false;
    }

    // 8. Warranty Flag
    if (filters.hasWarranty) {
      const warrantyAvailable = item.warrantyAvailable || item.warrantyCardAvailable || (item.warranty && item.warranty.available);
      if (!warrantyAvailable) return false;
    }

    // 9. Minimum Condition Rating (for used items)
    if (filters.minConditionRating !== undefined && item.conditionRating) {
      if (item.conditionRating < filters.minConditionRating) return false;
    }

    // 10. Minimum Health Score
    if (filters.minHealthScore !== undefined && item.healthScores) {
      if (item.healthScores.overallScore < filters.minHealthScore) return false;
    }

    // 11. Tags Filter
    if (filters.tags && filters.tags.length > 0) {
      if (!item.tags || !filters.tags.some((t) => item.tags?.includes(t))) {
        return false;
      }
    }

    return true;
  });

  // Sorting Logic
  if (filters.sortBy) {
    results = [...results].sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'health_score':
          return (b.healthScores?.overallScore || 0) - (a.healthScores?.overallScore || 0);
        case 'discount': {
          const discountA = a.originalPrice ? a.originalPrice - a.price : 0;
          const discountB = b.originalPrice ? b.originalPrice - b.price : 0;
          return discountB - discountA;
        }
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }

  return results;
}

/**
 * RELATED PRODUCTS ENGINE
 */
export function getRelatedProducts(currentProduct: Product, allProducts: Product[], limit = 4): Product[] {
  return allProducts
    .filter((p) => p.id !== currentProduct.id && p.status !== 'hidden')
    .sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (a.categoryId === currentProduct.categoryId) scoreA += 10;
      if (b.categoryId === currentProduct.categoryId) scoreB += 10;

      if (a.brand.toLowerCase() === currentProduct.brand.toLowerCase()) scoreA += 5;
      if (b.brand.toLowerCase() === currentProduct.brand.toLowerCase()) scoreB += 5;

      if (a.condition === currentProduct.condition) scoreA += 3;
      if (b.condition === currentProduct.condition) scoreB += 3;

      return scoreB - scoreA;
    })
    .slice(0, limit);
}

/**
 * SIMILAR PRODUCTS ENGINE (Price & Specification Tolerance)
 */
export function getSimilarProducts(
  currentProduct: Product,
  allProducts: Product[],
  priceTolerance = 0.25,
  limit = 4
): Product[] {
  const minP = currentProduct.price * (1 - priceTolerance);
  const maxP = currentProduct.price * (1 + priceTolerance);

  return allProducts
    .filter((p) => 
      p.id !== currentProduct.id &&
      p.categoryId === currentProduct.categoryId &&
      p.price >= minP &&
      p.price <= maxP &&
      p.status !== 'hidden'
    )
    .slice(0, limit);
}

/**
 * RECOMMENDED PRODUCTS ENGINE (Top Health Scores & Showroom Picks)
 */
export function getRecommendedProducts(allProducts: Product[], limit = 4): Product[] {
  return allProducts
    .filter((p) => p.status === 'available')
    .sort((a, b) => {
      const scoreA = (a.healthScores?.overallScore || 80) + (a.isFeatured ? 15 : 0);
      const scoreB = (b.healthScores?.overallScore || 80) + (b.isFeatured ? 15 : 0);
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

/**
 * RECENTLY VIEWED PRODUCTS HELPER
 */
export function getRecentlyViewedProducts(productIds: string[], allProducts: Product[]): Product[] {
  return productIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined);
}

/**
 * CUSTOMERS MAY ALSO LIKE (Cross-Category Appliance Bundles)
 */
export function getCustomersMayLikeProducts(currentProduct: Product, allProducts: Product[], limit = 4): Product[] {
  return allProducts
    .filter((p) => p.id !== currentProduct.id && p.categoryId !== currentProduct.categoryId && p.status === 'available')
    .sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    })
    .slice(0, limit);
}
