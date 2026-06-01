# Hero Section Images Setup

## Required Images

The hero section requires 3 high-quality images to be placed in the `public/images/` directory:

### Image Specifications

1. **hero-1.jpg** - Traditional couple wearing jewellery
   - Dimensions: 1920x1080px (minimum)
   - Format: JPG or WebP
   - Theme: Traditional Indian couple in ethnic wear showcasing jewellery
   - Similar to the design reference image provided

2. **hero-2.jpg** - Modern jewellery showcase
   - Dimensions: 1920x1080px (minimum)
   - Format: JPG or WebP
   - Theme: Contemporary jewellery display with elegant styling

3. **hero-3.jpg** - Gold jewellery close-up
   - Dimensions: 1920x1080px (minimum)
   - Format: JPG or WebP
   - Theme: BIS hallmarked gold jewellery with certification focus

## Directory Structure

```
frontend/
├── public/
│   ├── images/
│   │   ├── hero-1.jpg
│   │   ├── hero-2.jpg
│   │   └── hero-3.jpg
```

## Steps to Add Images

1. Create the `images` directory inside `public/`:
   ```bash
   mkdir public/images
   ```

2. Add your hero images to `public/images/` with the exact names:
   - `hero-1.jpg`
   - `hero-2.jpg`
   - `hero-3.jpg`

3. Ensure images are optimized for web:
   - Use tools like TinyPNG or ImageOptim
   - Target file size: < 500KB per image
   - Maintain aspect ratio: 16:9

## Temporary Placeholder

Until you add actual images, you can use placeholder services:

```typescript
// In HeroSection.tsx, temporarily replace image paths with:
image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=1080&fit=crop"
```

## Image Guidelines

- **Quality**: High-resolution, professional photography
- **Lighting**: Well-lit, showcasing jewellery details
- **Composition**: Follow rule of thirds, leave space for text overlay
- **Color**: Warm tones that complement gold (#C9A84C)
- **Rights**: Ensure you have proper licensing for all images

## Optimization Tips

1. Use Next.js Image component (already implemented)
2. Serve images in WebP format for better compression
3. Implement lazy loading for below-the-fold images
4. Consider using a CDN for faster delivery

## Contact

For questions about image requirements, contact the design team.
