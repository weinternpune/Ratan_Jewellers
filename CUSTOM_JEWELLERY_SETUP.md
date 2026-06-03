# Custom Jewellery Consultation System

## ✅ Setup Complete

The custom jewellery consultation system has been set up and is ready to use!

## 🚀 How to Start

### 1. Start Backend Server
```bash
cd backend
npm install  # if not already done
npm run dev  # or npm start
```

The backend should start on `http://localhost:5000`

### 2. Start Frontend Server
```bash
cd frontend
npm install  # if not already done
npm run dev
```

The frontend should start on `http://localhost:3000`

## 📍 Access Points

### Customer Side:
- **Custom Jewellery Page**: http://localhost:3000/custom-jewellery
- Customers can:
  - View categories
  - Browse gallery
  - Submit consultation requests via form at bottom

### Admin Side:
- **Admin Dashboard**: http://localhost:3000/admin/consultations
- Admins can:
  - View all consultation requests
  - Filter by status (pending, contacted, inprogress, completed, cancelled)
  - Update request status
  - Delete requests
  - View statistics

## 💾 Data Storage

Currently, consultation data is stored in a JSON file:
```
backend/data/consultations.json
```

This file will be created automatically when the first request is submitted.

## 🔧 Features

### Customer Form
- Name (required)
- Email (required)
- Phone (required)
- Category selection (required)
  - Engagement Ring
  - Wedding Band
  - Necklace
  - Earrings
  - Bracelet
  - Pendant
  - Other
- Design details message (required)

### Admin Dashboard
- **Status Management**: 
  - Pending (default)
  - Contacted
  - In Progress
  - Completed
  - Cancelled
- **Statistics Dashboard**: Shows counts for each status
- **Filtering**: Filter requests by status
- **Actions**: Update status, delete requests

## 📧 Notification

Currently shows toast notifications. To add email notifications:

1. Update the backend route with email service
2. Send email when request is submitted
3. Send email when status is updated

## 🔒 Security Notes

⚠️ **Important for Production**:
1. Add authentication to admin routes
2. Add authorization middleware
3. Move to proper database (MongoDB/PostgreSQL)
4. Add rate limiting on submission endpoint
5. Validate and sanitize all inputs
6. Add HTTPS in production

## 📝 Sample Data Format

```json
{
  "id": "1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 98765 43210",
  "category": "ring",
  "message": "I want to create a custom engagement ring...",
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

## ✨ Testing

1. Go to http://localhost:3000/custom-jewellery
2. Fill out the consultation form
3. Click "Submit Consultation Request"
4. You should see success message
5. Go to http://localhost:3000/admin/consultations
6. You should see your request listed
7. Try updating status and filtering

## 🐛 Troubleshooting

### "Failed to connect to server"
- Make sure backend is running on port 5000
- Check backend console for errors
- Verify CORS is enabled in backend

### Form submission fails
- Check browser console for errors
- Check backend console for errors
- Verify all form fields are filled
- Check backend/data/consultations.json exists

### Admin page shows no data
- Make sure at least one request has been submitted
- Check backend/data/consultations.json file exists
- Check backend API is responding: http://localhost:5000/api/custom-jewellery

## 📞 Support

If you encounter any issues, check:
1. Backend console logs
2. Frontend browser console
3. Network tab in browser developer tools
4. File permissions on backend/data folder
