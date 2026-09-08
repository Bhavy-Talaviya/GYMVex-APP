# MongoDB Atlas Setup for GYMVex

## ✅ Configuration Complete

Your GYMVex application is now connected to MongoDB Atlas with the following setup:

### Connection Details
- **Cluster Name:** GYMVex
- **Database Name:** GYMVex
- **Connection String:** `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/GYMVex`
- **Status:** Configured in `backend/.env` file

---

## 📊 Data Collections (Auto-Created by Mongoose)

Your application automatically manages these MongoDB collections:

### 1. **UserProfiles** 
   - Stores user personal data: name, email, height, weight, fitness goals
   - Stores profile images (URLs)
   - Settings: theme, experience level, activity level
   - **Fields:** userId, name, email, height, weight, targetWeight, profileImage, fitnessGoal, etc.

### 2. **Exercises**
   - Complete exercise database with 22+ fields
   - Includes: name, category, equipment, difficulty, muscle groups, instructions
   - Search-optimized with slug and full-text indexes
   - **Example:** Push-ups, Bench Press, Squats, Deadlifts, etc.

### 3. **WorkoutPlans**
   - Personalized workout plans for users
   - Contains exercise lists, schedules, difficulty levels
   - Linked to user profiles

### 4. **WorkoutLogs**
   - Records of completed workouts
   - Tracks: exercises performed, sets, reps, weight used, duration
   - Timestamp for progress tracking

### 5. **WeightLogs**
   - Daily/weekly weight tracking
   - Stores weight value, date, and unit (kg/lbs)
   - Helps track progress toward fitness goals

### 6. **NotificationSettings**
   - User notification preferences
   - Settings for reminders, alerts, and communications

### 7. **UserWorkoutState**
   - Tracks current workout session state
   - In-progress workout data

---

## 🚀 How to Use

### 1. **Start the Backend Server**
```bash
cd backend
npm install  # Install dependencies if not already done
npm start    # Start the server on http://localhost:5000
```

Expected output:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

### 2. **Seed Sample Data** (First time setup)
```bash
npm run seed
```

This populates your database with:
- Sample exercises
- Sample workout plans
- Ready-to-use fitness data

### 3. **API Endpoints Ready to Use**

```
GET  /api/exercises              - Get all exercises
GET  /api/exercises/search?q=push - Search exercises
GET  /api/exercises/category/Chest - Get by category
GET  /api/plans                  - Get all workout plans
POST /api/user-profile           - Create/update user profile
POST /api/fitness-tracking       - Log workout
POST /api/weight-tracking        - Log weight
```

---

## 📁 Data Storage for Images

### Profile Images
- Currently stored as **URLs** in the `profileImage` field
- Recommended: Use external image hosting (Unsplash, AWS S3, Cloudinary)
- Can implement file upload with MongoDB GridFS if needed

### Option 1: CloudinarySetup (Recommended for Production)
```javascript
// Add to your backend for file uploads
npm install cloudinary
// Store image URLs in MongoDB
```

### Option 2: MongoDB GridFS (Built-in)
```javascript
// For larger files, use GridFS
// Automatically handles files > 16MB
```

---

## 🔐 Security Notes

⚠️ **Important:** Never commit the `.env` file with credentials to Git!

Your `.env` file already has:
- `.gitignore` should include `.env`
- Credentials are only stored locally

For production:
- Use environment-specific credentials
- Enable IP whitelisting in MongoDB Atlas
- Use connection pooling

---

## 📊 Monitoring Your Database

### Via MongoDB Atlas Dashboard:
1. Go to https://cloud.mongodb.com/
2. Log in with your account (bhavy@...)
3. Select "GYMVex" cluster
4. View:
   - Collection sizes
   - Database operations
   - Performance metrics
   - Backups

---

## ✨ Features Enabled

✅ Automatic timestamps (createdAt, updatedAt) on all documents  
✅ Data validation and type checking  
✅ Indexes for faster queries  
✅ Unique constraints on userId and email  
✅ Enum validations for predefined fields  
✅ Error logging and connection monitoring  

---

## 🆘 Troubleshooting

### Connection Issues?
```bash
# Test connection
node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"
```

### Collections Not Appearing?
- Run the seed script: `npm run seed`
- Check MongoDB Atlas dashboard for data

### Slow Queries?
- Check database indexes
- Monitor via MongoDB Atlas Performance Advisor

---

## 📝 Next Steps

1. ✅ Backend is connected to MongoDB Atlas
2. 🔄 Run `npm run seed` to populate sample data
3. 🧪 Test API endpoints (use Postman/Insomnia)
4. 📱 Connect React Native frontend to these APIs
5. 🎯 Implement authentication/user login
6. 📸 Set up image hosting for profiles

