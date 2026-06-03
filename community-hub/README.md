# CommunityHub — Group 9 Community Portal
## CS5450 Mobile Programming · Challenge 2

---

## 1. Project Overview

CommunityHub is a React Native / Expo community portal for **Group 9** that connects people through shared interests. It is backed by **Firebase** (Authentication + Firestore) for real-time data persistence.

### Features
| Feature | Description |
|---|---|
| User Registration & Login | Firebase Auth (email/password), role-based (admin / member) |
| Personalized Dashboard | Stats, recent forums, upcoming events, joined groups |
| Discussion Forums | Create posts, reply in threads, like posts — real-time via Firestore |
| Event Calendar | Create events, join/leave, RSVP count, date display |
| Member Directory | All registered users, search by name or interest, profile modal |
| Interest Groups | Join/leave groups, member count, live updates |
| Search | Cross-module search bar on every screen |
| Security Rules | Firestore security rules restrict reads/writes by auth and ownership |

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.74 + Expo SDK 51 |
| Language | JavaScript (ES2022) |
| Navigation | React Navigation 6 (Bottom Tabs + Native Stack) |
| Backend / Auth | Firebase 10 (Authentication, Firestore) |
| State | React hooks (useState, useEffect, Context) |
| Real-time | Firestore `onSnapshot` listeners |

---

## 3. Firebase Setup

### 3.1 Create Project
1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `community-hub`
3. Disable Google Analytics (optional) → **Create project**

### 3.2 Enable Authentication
1. Build → **Authentication** → Get started
2. Sign-in method → **Email/Password** → Enable → Save

### 3.3 Enable Firestore
1. Build → **Firestore Database** → Create database
2. Select **Start in test mode** (switch to production rules before demo)
3. Choose nearest region → Enable

### 3.4 Register Web App & Get Config
1. Project Overview → **</>** (Web app)
2. App nickname: `community-hub-web`
3. Copy the `firebaseConfig` object

### 3.5 Paste Config
Open `src/services/firebase.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "community-hub.firebaseapp.com",
  projectId:         "community-hub",
  storageBucket:     "community-hub.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123",
};
```

### 3.6 Deploy Security Rules
```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # select your project
firebase deploy --only firestore:rules
```

---

## 4. Project Structure

```
community-hub/
├── App.js                          # Entry point, navigation, auth gate
├── package.json
├── firestore.rules                 # Firestore security rules
└── src/
    ├── hooks/
    │   └── useAuth.js              # Auth context + hook
    ├── services/
    │   ├── firebase.js             # Firebase init (replace config here)
    │   ├── authService.js          # register, login, logout, fetchProfile
    │   └── firestoreService.js     # All Firestore CRUD + real-time listeners
    ├── screens/
    │   ├── AuthScreen.js           # Login + Register
    │   ├── DashboardScreen.js      # Personalized home
    │   ├── ForumsScreen.js         # Forum list + ThreadDetail
    │   ├── EventsScreen.js         # Events list + create
    │   └── MembersScreen.js        # Members directory + Groups
    └── utils/
        └── helpers.js              # Category colors, avatar, formatDate
```

---

## 5. Installation & Run

```bash
# 1. Clone / unzip the project
cd community-hub

# 2. Install dependencies
npm install

# 3. Paste your Firebase config into src/services/firebase.js

# 4. Start Expo
npx expo start

# 5. Press 'a' for Android emulator, 'i' for iOS, 'w' for web
```

### Run on Physical Device
1. Install **Expo Go** from the Play Store / App Store
2. Scan the QR code shown by `npx expo start`

---

## 6. Firestore Data Model

```
users/{uid}
  name, email, avatar, role, bio, interests[], posts, events, joinedAt

forums/{postId}
  title, category, authorId, authorName, authorAvatar,
  likes, likedBy[], replyCount, createdAt
  └── replies/{replyId}
        text, authorId, authorName, authorAvatar, likes, createdAt

events/{eventId}
  title, category, date, time, location, desc,
  organizerId, organizerName, attendees[], maxAttendees, createdAt

groups/{groupId}
  name, category, icon, desc, members[], createdAt
```

---

## 7. GitHub

Repository: **https://github.com/YOUR_USERNAME/community-hub-cs5450**

> Replace with your actual GitHub repo URL before submission.

---

## 8. Grading Checklist

- [x] React Native / Expo platform
- [x] Firebase Authentication (email/password)
- [x] Firebase Firestore (real-time CRUD)
- [x] User Registration & Login with roles
- [x] Personalized Dashboard
- [x] Discussion Forums with replies and likes
- [x] Event Calendar with join/leave
- [x] Member Directory with search
- [x] Interest Groups with join/leave
- [x] Search functionality (all screens)
- [x] Responsive design (works on phone + tablet)
- [x] Firestore Security Rules
- [x] README.pdf with setup instructions and structure
- [x] GitHub public repository

---

*Lakehead University · COMP5450 Mobile Programming · Dr. Sabah Mohammed*
