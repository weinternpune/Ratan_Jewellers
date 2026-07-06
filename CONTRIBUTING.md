# Contributing to Ratan Jewellers

## 🎯 Getting Started

### Prerequisites
- Node.js 18 or higher
- MongoDB (local installation or MongoDB Atlas account)
- Git

### Setup Steps

1. **Fork & Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ratan-jewellers.git
   cd ratan-jewellers
   ```

2. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run seed:staff  # IMPORTANT: Creates admin users
   npm run dev
   ```

3. **Frontend Setup** (new terminal)
   ```bash
   cd frontend
   echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
   npm install
   npm run dev
   ```

4. **Verify Setup**
   - Backend: http://localhost:5000/health
   - Frontend: http://localhost:3000
   - Login with: uttamkumar86830@gmail.com / SuperAdmin@2025#RJ

---

## 🐛 Common Setup Issues

### "Login failed - 401 Unauthorized"
**Cause:** No users in database
**Fix:** Run `npm run seed:staff` in backend folder

### "CORS error" in browser console
**Cause:** Backend not running or wrong URL
**Fix:** 
1. Ensure backend is running on port 5000
2. Check .env.local in frontend has correct API URL

### "Cannot connect to MongoDB"
**Cause:** MongoDB not running or wrong connection string
**Fix:**
1. Start MongoDB: `mongod` or use MongoDB Atlas
2. Update MONGODB_URI in backend/.env

---

## 📝 Development Workflow

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes & test**
   - Test locally before committing
   - Ensure both backend and frontend work

3. **Commit with clear messages**
   ```bash
   git add .
   git commit -m "feat: add customer export feature"
   ```

4. **Push & Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Build/config changes

---

## 🧪 Testing Your Changes

### Backend Testing
```bash
cd backend
npm run dev
# Test API endpoints with Postman or curl
```

### Frontend Testing
```bash
cd frontend
npm run dev
# Manual testing in browser
```

### Key Test Scenarios
1. **Login/Logout** - Test with different user roles
2. **CRUD Operations** - Create, read, update, delete
3. **Error Handling** - Test invalid inputs
4. **Responsive Design** - Test on mobile/tablet/desktop

---

## 🔐 User Roles & Permissions

After running `npm run seed:staff`, you get these test accounts:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | uttamkumar86830@gmail.com | SuperAdmin@2025#RJ |
| Admin | priya@ratanjewellers.com | Admin@2025#RJ |
| Store Manager | suresh@ratanjewellers.com | Manager@2025#RJ |
| Inventory Manager | anita@ratanjewellers.com | Inventory@2025#RJ |
| Sales Staff | vikram@ratanjewellers.com | Sales@2025#RJ |
| Sales Staff | kavya@ratanjewellers.com | Sales2@2025#RJ |

---

## 📂 Project Structure

```
ratan-jewellers/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth, validation
│   │   └── services/       # Business logic
│   └── SETUP.md           # Detailed backend setup
├── frontend/
│   └── src/
│       ├── app/           # Next.js 14 pages
│       ├── components/    # React components
│       ├── store/         # Zustand state
│       └── lib/           # Utilities
└── README.md
```

---

## 💡 Tips for Contributors

### Before Submitting PR
- [ ] Code runs without errors
- [ ] Tested with different user roles
- [ ] No console errors in browser
- [ ] Responsive design works
- [ ] Clear commit messages

### Best Practices
- Keep commits focused and atomic
- Write descriptive PR descriptions
- Reference issue numbers in commits
- Test on both dev and production builds

### Need Help?
- Check SETUP.md in backend folder
- Review existing code for patterns
- Ask questions in issues/discussions

---

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help other contributors
- Follow existing code style

---

## 📧 Contact

Questions? Reach out to: uttamkumar86830@gmail.com

Thank you for contributing! 🙏
