# Frontend Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Backend server running

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the frontend directory:

```bash
# Copy the example file
cp .env.example .env.local
```

Or create `.env.local` manually with this content:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Important:** Make sure the backend server is running on port 5000, or update the URL accordingly.

### 3. Start Development Server
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Common Issues

### "Route not found" Error
**Problem:** Gold rates refresh button returns 404 error

**Solution:** 
1. Make sure `.env.local` file exists with correct `NEXT_PUBLIC_API_URL`
2. Verify backend server is running on the correct port
3. Restart the frontend development server after creating/editing `.env.local`

### Environment Variables Not Working
**Problem:** Changes to `.env.local` not taking effect

**Solution:** 
- Restart the Next.js development server (stop with Ctrl+C and run `npm run dev` again)
- Clear browser cache and reload
- Delete `.next` folder and restart: `rm -rf .next && npm run dev`

## Production Deployment

For production, update `.env.local` (or create `.env.production.local`):
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

## File Structure
```
frontend/
├── .env.local          # Local environment variables (git ignored)
├── .env.example        # Example env file (committed to git)
├── src/
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   └── store/         # State management
└── public/            # Static assets
```

## Important Notes
- Never commit `.env.local` to git (contains sensitive data)
- Always use `.env.example` as a template for new developers
- `NEXT_PUBLIC_` prefix is required for client-side environment variables in Next.js
