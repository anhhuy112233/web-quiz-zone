# ✅ Production Deployment Checklist - Web Quiz Zone

## 🎯 Thông Tin Production
- **Frontend:** https://web-quiz-zone.vercel.app
- **Backend:** https://web-quiz-zone.onrender.com
- **Database:** MongoDB Atlas (webquizzone.hzbf0rv.mongodb.net)

## 📋 Pre-Deployment Checklist

### 1. MongoDB Atlas Setup ✅
- [ ] Database cluster created
- [ ] Database user created (hyday23/huy123)
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string ready
- [ ] Database name: `exam-system`

### 2. Backend (Render) Setup ✅
- [ ] Render account created
- [ ] GitHub repository connected
- [ ] Web service created
- [ ] Root directory set to `backend`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Port: 5000

### 3. Frontend (Vercel) Setup ✅
- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Project created
- [ ] Root directory set to `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

## 🔧 Environment Variables Setup

### Render (Backend) Environment Variables
```env
MONGODB_URI=mongodb+srv://hyday23:huy123@webquizzone.hzbf0rv.mongodb.net/?retryWrites=true&w=majority&appName=webquizzone
JWT_SECRET=web-quiz-zone-production-secret-key-2024
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://web-quiz-zone.vercel.app
MAX_FILE_SIZE=5242880
```

### Vercel (Frontend) Environment Variables
```env
VITE_API_URL=https://web-quiz-zone.onrender.com
VITE_SOCKET_URL=https://web-quiz-zone.onrender.com
VITE_NODE_ENV=production
```

## 🚀 Deployment Steps

### Step 1: Deploy Backend
1. [ ] Push code to GitHub
2. [ ] Render auto-deploys
3. [ ] Check deployment logs
4. [ ] Verify health endpoint: `/health`
5. [ ] Test API endpoints

### Step 2: Deploy Frontend
1. [ ] Push code to GitHub
2. [ ] Vercel auto-deploys
3. [ ] Check deployment logs
4. [ ] Verify frontend loads
5. [ ] Test navigation

### Step 3: Create User Accounts
1. [ ] Run account creation script
2. [ ] Verify admin account created
3. [ ] Verify teacher account created
4. [ ] Verify student account created

## 🧪 Testing Checklist

### Backend Testing
- [ ] Health check endpoint: `/health`
- [ ] Root endpoint: `/`
- [ ] Auth endpoint: `/api/auth/login`
- [ ] CORS configuration
- [ ] MongoDB connection
- [ ] JWT token generation

### Frontend Testing
- [ ] Page loads without errors
- [ ] Navigation works
- [ ] Login form accessible
- [ ] API calls work
- [ ] Socket.IO connection
- [ ] Responsive design

### Integration Testing
- [ ] Login with admin account
- [ ] Login with teacher account
- [ ] Login with student account
- [ ] Create exam (teacher)
- [ ] Take exam (student)
- [ ] View results (all roles)

## 🔐 User Accounts

### Default Accounts
```
👤 Admin:    admin / admin123
👨‍🏫 Teacher:  teacher / teacher123
👨‍🎓 Student:  student / student123
```

### Account Creation Commands
```bash
# Install dependencies
cd backend
npm install

# Create accounts
node create-admin-account.js

# Test connection
node test-production-connection.js
```

## 🚨 Troubleshooting

### Common Issues
1. **CORS Errors**
   - Check `FRONTEND_URL` in Render
   - Verify URL format (https://)

2. **MongoDB Connection Failed**
   - Check `MONGODB_URI` in Render
   - Verify network access in Atlas
   - Check user credentials

3. **Frontend API Errors**
   - Check `VITE_API_URL` in Vercel
   - Verify backend is running
   - Check browser console

4. **Build Failures**
   - Check Node.js version
   - Verify dependencies
   - Check build logs

### Debug Commands
```bash
# Test backend health
curl https://web-quiz-zone.onrender.com/health

# Test frontend
curl https://web-quiz-zone.vercel.app

# Test API endpoint
curl https://web-quiz-zone.onrender.com/api/auth/login
```

## 📊 Monitoring

### Backend Monitoring
- [ ] Render dashboard logs
- [ ] Health endpoint monitoring
- [ ] Error rate monitoring
- [ ] Response time monitoring

### Frontend Monitoring
- [ ] Vercel dashboard logs
- [ ] Browser console errors
- [ ] Page load performance
- [ ] User interaction tracking

### Database Monitoring
- [ ] MongoDB Atlas metrics
- [ ] Connection pool status
- [ ] Query performance
- [ ] Storage usage

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] CORS properly configured
- [ ] Environment variables not exposed
- [ ] HTTPS enabled on all services
- [ ] Database user has minimal privileges
- [ ] API endpoints protected
- [ ] File uploads secured

## 📈 Performance Optimization

- [ ] Enable compression
- [ ] Optimize images
- [ ] Minify CSS/JS
- [ ] Enable caching
- [ ] Database indexing
- [ ] CDN configuration

## 🎉 Go Live Checklist

### Final Verification
- [ ] All tests passing
- [ ] All accounts created
- [ ] All features working
- [ ] Performance acceptable
- [ ] Security measures in place
- [ ] Monitoring configured
- [ ] Documentation updated

### Launch Steps
1. [ ] Announce to users
2. [ ] Monitor for issues
3. [ ] Collect feedback
4. [ ] Plan improvements

## 📞 Support Information

### URLs
- **Production:** https://web-quiz-zone.vercel.app
- **Backend API:** https://web-quiz-zone.onrender.com
- **Health Check:** https://web-quiz-zone.onrender.com/health

### Contact
- **Documentation:** Check docs/ folder
- **Issues:** Check deployment logs
- **Support:** Review troubleshooting guide 