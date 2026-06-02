# Quick Start Guide - Ratan Jewellers

## What's New? 🎉

The Navbar and Hero Section have been completely redesigned based on the PRD v1.0 specifications and design mockup.

## Key Features

### Enhanced Navbar
- ✨ Premium gold and obsidian color scheme
- 📱 Fully responsive with mobile menu
- 🎯 Live gold rate display
- 🛍️ Shopping cart with item count
- 👤 User account integration
- 🔍 Search functionality
- 📍 Store locator link

### Dynamic Hero Section
- 🎬 Auto-rotating carousel (3 slides)
- 🖼️ Full-screen background images
- ✨ Smooth animations with Framer Motion
- 📞 Floating WhatsApp & phone buttons
- 🎨 Luxury design with gold accents
- 📱 Mobile-optimized

## Quick Setup

### 1. Add Hero Images (Required)

Create the images directory and add your hero images:

```bash
mkdir public/images
```

Add these 3 images to `public/images/`:
- `hero-1.jpg` - Traditional couple (1920x1080px)
- `hero-2.jpg` - Modern jewellery (1920x1080px)
- `hero-3.jpg` - Gold close-up (1920x1080px)

**Temporary Solution**: Use placeholder images from Unsplash until you have actual photos.

### 2. Update Contact Information

Edit `src/components/home/HeroSection.tsx`:

```typescript
// Line ~200 - Update WhatsApp number
href="https://wa.me/919876543210"  // Replace with your number

// Line ~210 - Update phone number
href="tel:+919876543210"  // Replace with your number
```

### 3. Run the Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## File Changes

### Modified Files
1. ✅ `src/components/layout/Navbar.tsx` - Complete redesign
2. ✅ `src/components/home/HeroSection.tsx` - New carousel system
3. ✅ `src/app/globals.css` - Already has design system

### New Documentation
1. 📄 `HERO_IMAGES_README.md` - Image specifications
2. 📄 `IMPLEMENTATION_NOTES.md` - Detailed documentation
3. 📄 `QUICK_START.md` - This file

## Design System

### Colors
- **Primary Gold**: #C9A84C
- **Gold Light**: #E8D5A3
- **Gold Dark**: #9D7A2E
- **Obsidian**: #0D0700
- **Ivory**: #FAF6EE

### Typography
- **Display**: Cormorant Garamond (headings)
- **Body**: Inter (text)
- **Code**: JetBrains Mono (SKUs, rates)

### Spacing
- Based on 8px grid system
- Consistent padding and margins
- Responsive breakpoints

## Testing

### Desktop
1. Open http://localhost:3000
2. Scroll down to see navbar change
3. Click "Collections" to see dropdown
4. Test hero carousel navigation
5. Click floating contact buttons

### Mobile
1. Resize browser to mobile width
2. Test hamburger menu
3. Verify touch-friendly buttons
4. Check hero swipe gestures

## Customization

### Change Hero Slide Content

Edit `src/components/home/HeroSection.tsx`:

```typescript
const heroSlides = [
  {
    id: 1,
    title: "Your Title",
    subtitle: "Your Subtitle",
    description: "Your description",
    image: "/images/hero-1.jpg",
    cta: "BUTTON TEXT",
    ctaLink: "/your-link"
  },
  // Add more slides...
]
```

### Modify Navigation Items

Edit `src/components/layout/Navbar.tsx`:

```typescript
// Around line 150 - Desktop Navigation
<Link href="/your-page">YOUR LINK</Link>
```

### Update Gold Rate

The gold rate is managed by Zustand store. Update in:
`src/store/uiStore.ts` (if exists) or configure API integration.

## Troubleshooting

### Images Not Showing
- ✅ Check images are in `public/images/`
- ✅ Verify file names match exactly
- ✅ Clear Next.js cache: `rm -rf .next`

### Navbar Not Transparent
- ✅ Must be on homepage (`/`)
- ✅ Scroll to top of page
- ✅ Check `isHome` and `scrolled` state

### Mobile Menu Not Working
- ✅ Check Zustand store is configured
- ✅ Verify `toggleMobileMenu` function
- ✅ Test on actual mobile device

### Animations Laggy
- ✅ Reduce motion in browser settings
- ✅ Check GPU acceleration
- ✅ Optimize image sizes

## Next Steps

1. **Add Real Images** - Replace placeholder images
2. **Configure WhatsApp** - Set up Meta Business API
3. **Test Thoroughly** - All devices and browsers
4. **Deploy** - Push to production

## Support

For detailed information, see:
- 📖 `IMPLEMENTATION_NOTES.md` - Full documentation
- 🖼️ `HERO_IMAGES_README.md` - Image guidelines
- 📋 PRD v1.0 - Original requirements

## Production Checklist

Before deploying:
- [ ] Add all 3 hero images
- [ ] Update contact phone numbers
- [ ] Test on real mobile devices
- [ ] Verify all links work
- [ ] Check loading performance
- [ ] Test with slow 3G connection
- [ ] Validate accessibility
- [ ] Run Lighthouse audit

---

**Ready to go!** 🚀

The navbar and hero section are production-ready once you add the hero images.
