const fs = require('fs');
const path = 'frontend/src/app/products/ProductsClient.tsx';
let c = fs.readFileSync(path, 'utf8');

// Remove corrupted lines
c = c.split('\n').filter(l => 
  !l.includes('useProductCatalog') && 
  !l.includes('storeProducts') &&
  !l.includes('deleteCatalogProduct') &&
  !l.includes('toggleFeatured') &&
  !l.includes('toggleTrending') &&
  !l.includes('toggleStock')
).join('\n');

// Fix missing useEffect opening
c = c.replace(
  "  const searchParams = useSearchParams()\n    if (searchParam)",
  "  const searchParams = useSearchParams()\n\n  useEffect(() => {\n    const searchParam   = searchParams.get('search')\n    const categoryParam = searchParams.get('category')\n    const metalParam    = searchParams.get('metal')\n    const purityParam   = searchParams.get('purity')\n    if (searchParam)"
);

// Add normalizeFilterValue if missing
if (c.indexOf('normalizeFilterValue') === -1) {
  c = c.replace(
    'const PRICE_RANGES',
    "const normalizeFilterValue = (param, list) => {\n  if (!param) return ''\n  const match = list.find(item => item.toLowerCase() === param.toLowerCase())\n  return match ? match.toLowerCase() : ''\n}\n\nconst PRICE_RANGES"
  );
}

fs.writeFileSync(path, c);
console.log('done');
console.log('remaining bad refs:', (c.match(/useProductCatalog|storeProducts/g) || []).length);
