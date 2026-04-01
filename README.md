# 🎥 WeStream - Private Livestream Platform

WeStream is a mobile-first, private livestreaming platform designed for invited viewers only. Stream live from your camera or upload MP4 videos for private playback — no public feeds, no strangers.

## 🧩 Core Features

- **🔒 Private Streaming System**: Create invite-only streams with unique private links.
- **🎥 Dual Streaming Options**:
  - **Go Live**: Stream directly using your camera/microphone (WebRTC).
  - **Video Playback**: Upload MP4 videos and "stream" them to your audience.
- **🌐 Multi-Stream Destinations**: Simulcast your private stream to YouTube, Facebook, or any custom RTMP endpoint.
- **👥 Viewer Access**: Viewers join instantly via invite link without signing in.
- **💬 Real-Time Chat**: Low-latency chat system for live interaction.
- **📱 Mobile-First Design**: Optimized for phones with a modern, high-end "mission control" aesthetic.
- **⚙️ Streamer Dashboard (CMS)**: Start/stop streams, upload videos, generate invite links, and view analytics.

## 🧱 Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 🚀 Getting Started

### 1. Prerequisites
- Node.js installed
- A Firebase project created at [console.firebase.google.com](https://console.firebase.google.com/)

### 2. Firebase Setup
Enable the following services in your Firebase console:
- **Authentication**: Enable Google Sign-In.
- **Firestore Database**: Create a database in production mode.
- **Storage**: Enable Firebase Storage for video uploads.

### 3. Environment Variables
Create a `.env` file in the root directory and add your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Installation
```bash
npm install
npm run dev
```

## 🔐 Security Rules
Deploy the provided `firestore.rules` to your Firebase project to ensure data privacy:
- Only authenticated streamers can create/update their own streams.
- Viewers can only read streams and post messages if they have the unique stream ID.

## 📦 Deployment

### GitHub + Vercel
1. Push your code to a GitHub repository.
2. Connect your repository to [Vercel](https://vercel.com/).
3. Add your environment variables in the Vercel project settings.
4. Deploy!

---
*Built with WeStream Private Network Technology.*
