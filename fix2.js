const fs = require('fs');
const path = 'frontend/src/app/products/ProductsClient.tsx';
let c = fs.readFileSync(path, 'utf8');

const fn = `const normalizeFilterValue = (param, list) => {
  if (!param) return ''
  const m = list.find(i => i.toLowerCase() === param.toLowerCase())
  return m ? m.toLowerCase() : ''
}

`;

if (c.indexOf('const normalizeFilterValue') === -1) {
  c = c.replace('const METALS', fn + 'const METALS');
  fs.writeFileSync(path, c);
  console.log('normalizeFilterValue added successfully');
} else {
  console.log('already exists at line', c.split('\n').findIndex(l => l.includes('const normalizeFilterValue')) + 1);
}
