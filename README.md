# 🏋️ GYMVex — Gym & Fitness Mobile Application

[![React Native](https://img.shields.io/badge/React_Native-0.88-61DAFB?style=flat&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo SDK](https://img.shields.io/badge/Expo_SDK-58.0.5-000020?style=flat&logo=expo&logoColor=white)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> **Train. Track. Transform.**  
> GYMVex is an athletic mobile fitness application built with React Native and Expo, powered by an Express.js & MongoDB backend. It delivers curated workout plans, real-time exercise set trackers, interactive rest timers, personalized health metrics, and seamless Dark/Light theme switching.

---

## 🌟 Overview

GYMVex is engineered for fitness enthusiasts and athletes seeking structure, precision, and motivation. Whether you are aiming for weight loss, lean muscle hypertrophy, endurance, or flexibility, GYMVex guides you from onboarding to goal completion with smooth spring animations, local session persistence, and instant REST API connectivity.

The project is hosted live on:
- **GitHub Repository**: [https://github.com/Bhavy-Talaviya/GYMVex-APP](https://github.com/Bhavy-Talaviya/GYMVex-APP)
- **Live Backend API**: `https://gymvex-app.onrender.com/api`

---

## ✨ Actual Project Features

### 1. Animated Splash & Brand Experience
- High-resolution 3D dumbbell emblem with spring physics entrance.
- Guaranteed 2.2s splash branding window on cold boot.
- Native `expo-splash-screen` handshake to prevent white flashes.

### 2. Guided Onboarding & Secure Authentication
- Minimalist hero workout carousel (Power, Strength, Athleticism, Endurance).
- Fast mode switcher between **Sign In** and **Create Account**.
- Client and server-side validation with local session caching (`@react-native-async-storage/async-storage`).
- Secure session logout and permanent account deletion.

### 3. Dynamic Athlete Dashboard
- Daily motivation carousel featuring inspirational athletic quotes.
- Quick Action shortcuts (Today's Workout, Plans, Exercises, History, Reminders, Profile).
- Horizontal workout categories (Strength, Cardio, HIIT, Yoga, Boxing).
- Featured multi-week workout programs.
- Side navigation drawer with quick links and athlete profile badges.

### 4. Interactive Workout Execution ("Today's Workout")
- 7-Day interactive schedule for active enrolled plans.
- Live elapsed workout timer.
- Set-by-set interactive completion checkboxes.
- Dynamic rest modal with automated countdown timer and sound cues.
- Real-time progress bar tracking sets completed vs. total sets.
- Built-in scheduled Rest & Active Recovery day protocols.

### 5. Comprehensive Exercise Library & Search
- 60+ categorized exercises (Chest, Back, Arms, Legs, Core, Cardio, Yoga).
- Real-time instant search by name, muscle group, or equipment.
- Filter chips by category and difficulty levels (Beginner, Intermediate, Advanced).
- Detailed exercise guide screens with step-by-step instructions, target muscles, equipment needed, and safety tips.
- Personal favorites bookmarking.

### 6. Curated Workout Plans
- Goal-based plans (Muscle Gain, Fat Loss, Powerlifting, Mobility).
- Personalized plan recommendations based on user fitness level.
- Multi-week plan enrollments with progress tracking.

### 7. Workout History & Analytics
- Complete session logging with calories burned, elapsed duration, and date timestamps.
- Streak counter and overall volume tracking.

### 8. Customization & System Preferences
- **Theme Switcher**: Instant toggle between OLED Athletic Dark Mode and Clean Minimalist Light Mode.
- **Unit Conversions**: Metric (kg, cm) and Imperial (lbs, ft) weight and height unit toggles.
- **Push Reminders**: Workout alert schedules with 24-hour time presets and weekday selection.
- **Profile Photo Customization**: Image picker support with camera and gallery access.

---

## 🛠️ Technologies & Stack

### Client (Mobile Application)
- **Framework**: [React Native 0.88](https://reactnative.dev/)
- **Ecosystem**: [Expo SDK 58.0.5](https://docs.expo.dev/)
- **Routing**: [Expo Router v58](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Animation**: React Native Animated API & [Reanimated 4](https://docs.swmansion.com/react-native-reanimated/)
- **Persistence**: `@react-native-async-storage/async-storage`
- **Media & Icons**: `expo-image`, `expo-image-picker`, `@expo/vector-icons` (Ionicons)
- **Build Service**: EAS Build (Expo Application Services)

### Server (REST API)
- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Web Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/)
- **Authentication**: Bcrypt.js password hashing & session management
- **Middleware**: CORS, Morgan HTTP logger, Dotenv
- **Deployment**: Render Cloud Platform

---

## 📂 Project Architecture & Folder Structure

```text
GYMVex-APP/
├── README.md                      # Project documentation & guides
│
└── GYMVex/                        # Mobile App Root
    ├── app/                       # Expo Router file-based screens
    │   ├── _layout.tsx            # Global Root Layout (Theme & Stack Navigator)
    │   ├── index.tsx              # Splash & Onboarding Carousel
    │   ├── sign.tsx               # Login & Registration authentication screen
    │   ├── exercise-details.tsx   # Detailed exercise guide & execution screen
    │   ├── plan-details.tsx       # Workout plan overview & enrollment screen
    │   ├── notification-settings.tsx # Daily workout reminders & push preferences
    │   ├── profile-settings.tsx   # Athlete profile, metric units & theme switcher
    │   └── (tabs)/                # Bottom Tab Navigation
    │       ├── _layout.tsx        # Tabs Layout & Haptic Tab Bar
    │       ├── home.tsx           # Athlete Dashboard & Side Drawer
    │       ├── plans.tsx          # Browse & Filter Workout Plans
    │       ├── today-workout.tsx  # Daily interactive workout checklist & timer
    │       ├── exercises.tsx      # Categorized Exercise Library
    │       └── history.tsx        # Workout completion history & streaks
    │
    ├── assets/
    │   └── images/                # 3D Dumbbell Logo, Icons & Splash Assets
    │
    ├── backend/                   # Express.js REST API
    │   ├── controllers/           # API business logic
    │   ├── models/                # Mongoose schemas (User, Exercise, Plan, Log)
    │   ├── routes/                # Modular Express routes
    │   ├── seed/                  # Exercise & workout plan seed data
    │   ├── server.js              # Express server entry point
    │   ├── package.json           # Backend dependencies
    │   └── .env.example           # Backend environment template
    │
    ├── components/                # Reusable UI component library
    │   ├── ui/                    # Buttons, Cards, Inputs, AppImage
    │   └── haptic-tab.tsx         # Tactile tab bar pressable
    │
    ├── context/
    │   └── ThemeContext.tsx       # Light & Dark theme state & tokens
    │
    ├── services/                  # Network & API client modules
    │   ├── config.js              # Dynamic API base URL resolver (Local / Live)
    │   ├── authApi.ts             # Auth HTTP client
    │   ├── exerciseApi.ts         # Exercise HTTP client
    │   ├── workoutPlanApi.ts      # Plan enrollment & completion client
    │   ├── notificationService.ts # Local & push notification scheduler
    │   └── userProfileApi.ts      # Profile metrics & session storage
    │
    ├── app.json                   # Expo application manifest
    ├── eas.json                   # EAS Build profiles (APK preview & production)
    ├── package.json               # Frontend dependencies & scripts
    ├── tsconfig.json              # TypeScript strict configuration
    └── .env.example               # Frontend environment template
```

---

## ⚡ Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (Version 18.x or 20.x recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- [Expo Go App](https://expo.dev/go) installed on your physical Android or iOS device, or an active Android Studio / Xcode Simulator.

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Bhavy-Talaviya/GYMVex-APP.git
cd GYMVex-APP/GYMVex
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. (Optional) Install Backend Dependencies
If you plan to run the backend locally instead of using the live Render cloud:
```bash
cd backend
npm install
cd ..
```

---

## ⚙️ Environment Configuration

### Frontend Environment Setup (`GYMVex/.env`)
Create a `.env` file inside `GYMVex/` (or copy from `.env.example`):
```env
# Default: Live production backend on Render
EXPO_PUBLIC_API_URL=https://gymvex-app.onrender.com/api

# For local backend testing (optional override):
# EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:5000/api
```

### Backend Environment Setup (`GYMVex/backend/.env`)
If hosting the backend locally:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/gymvex?retryWrites=true&w=majority
NODE_ENV=development
```

---

## 💻 Available NPM Scripts

From the `GYMVex/` directory:

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **`npm run dev`** | `expo start --go --tunnel -c` | Starts Metro with Expo Go mode & tunnel connection |
| **`npm start`** | `expo start --go` | Starts Metro bundler in Expo Go mode |
| **`npm run tunnel`** | `expo start --go --tunnel -c` | Clears cache and launches Expo tunnel server |
| **`npm run android`** | `expo start --android` | Opens project on connected Android device/emulator |
| **`npm run ios`** | `expo start --ios` | Opens project on iOS simulator |
| **`npm run web`** | `expo start --web` | Runs web preview on local browser |
| **`npm run typecheck`** | `tsc --noEmit` | Runs strict TypeScript verification |
| **`npm run backend`** | `node backend/server.js` | Starts local Express.js backend server |
| **`npm run reset:db`** | `node backend/seed/resetAllData.js` | Seeds MongoDB with complete exercises & plans |
| **`npm run build:apk`** | `eas build -p android --profile preview` | Compiles installable Android `.apk` via EAS |

---

## 🌐 Backend REST API Reference

Base URL (Production): `https://gymvex-app.onrender.com/api`

### Authentication & Profile (`/api/auth` & `/api/user`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new athlete with name, email, and password |
| `POST` | `/api/auth/login` | Authenticate user credentials and return session token |
| `DELETE` | `/api/auth/account` | Permanently delete athlete account & associated data |
| `GET` | `/api/user/profile` | Retrieve user fitness metrics (height, weight, goal) |
| `PUT` | `/api/user/profile` | Update profile information & metric units |

### Exercise Library (`/api/exercises`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/exercises` | List all exercises with optional category & difficulty filters |
| `GET` | `/api/exercises/search?q=` | Search exercise by name, muscle group, or keyword |
| `GET` | `/api/exercises/:id` | Fetch complete exercise instructions and guide |

### Workout Plans & Enrollment (`/api/plans` & `/api/user-plan`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/plans` | Browse all curated training programs |
| `GET` | `/api/plans/recommended` | Get suggested programs tailored to user fitness goal |
| `GET` | `/api/plans/:id` | Retrieve plan schedule and daily workout breakdown |
| `GET` | `/api/user-plan/state` | Fetch currently active enrolled plan & week progress |
| `POST` | `/api/user-plan/start` | Enroll user in a workout plan |
| `POST` | `/api/user-plan/complete-workout` | Log daily workout completion and advance schedule |

### Tracking & Notifications (`/api`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tracking/history` | Retrieve logged workout session history |
| `POST` | `/api/tracking/log` | Record completed workout duration and calories burned |
| `GET` | `/api/notifications/settings`| Fetch daily alert preferences |
| `PUT` | `/api/notifications/settings`| Save reminder time presets and active notification days |

---

## 📲 App Flow & Navigation

```text
               ┌───────────────────────┐
               │  Animated Splash (2s) │
               │  3D Dumbbell & Brand  │
               └──────────┬────────────┘
                          │
            Session Active?
           ┌──────┴──────┐
          YES            NO
           │             │
           │   ┌─────────▼─────────┐
           │   │ Onboarding Screen │
           │   │ (Get Started)     │
           │   └─────────┬─────────┘
           │             │
           │   ┌─────────▼─────────┐
           │   │   Auth Screen     │
           │   │ (Sign In/Sign Up) │
           │   └─────────┬─────────┘
           │             │
           └──────┬──────┘
                  │
        ┌─────────▼─────────┐
        │   Tabs Navigator  │
        ├───────────────────┤
        │ • Home Dashboard  │ ──► Side Drawer Menu
        │ • Workout Plans   │ ──► Plan Details & Enrollment
        │ • Today's Workout │ ──► Rest Timer & Set Completion
        │ • Exercises       │ ──► Exercise Guide & Search
        │ • History         │ ──► Completed Session Logs
        └───────────────────┘
```

---


## 🔮 Future Improvements

- [ ] **Wearable Integration**: Sync heart rate and calories with Apple HealthKit & Google Health Connect.
- [ ] **Social Workout Feed**: Share workout completions and challenge friends.
- [ ] **Offline Mode**: Local SQLite caching for offline workout logging without active internet.
- [ ] **Custom Plan Builder**: Allow athletes to create custom multi-week routines.

---

## 🤝 Contribution Guidelines

Contributions, bug reports, and suggestions are welcome!
1. **Fork** the repository: [https://github.com/Bhavy-Talaviya/GYMVex-APP](https://github.com/Bhavy-Talaviya/GYMVex-APP)
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push to your branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request** describing your changes.

---

## 👨‍💻 Author & License

Developed with passion by **[Bhavy Talaviya](https://github.com/Bhavy-Talaviya)**.

© 2026 Bhavy Talaviya. All rights reserved.

⭐ If you enjoy using **GYMVex**, please star this repository on GitHub!
