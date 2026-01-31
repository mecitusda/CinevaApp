# 🎬 Cineva

Cineva is a modern, fast, and user-focused **movie & TV show discovery platform**.  
It allows users to explore categorized content, search titles in real time, view detailed information, watch trailers, and build personal lists.

> Designed with a strong focus on performance, usability, and clean architecture.

---

## 🚀 Demo & Overview

<!-- 🔥 MAIN SHOWCASE GIF -->
<!-- Homepage general flow -->
![Cineva Overview](ts-project/public/gifs/home.gif)

---

## ✨ Features

- 🎞️ Movie & TV show discovery
- 🗂️ Category-based browsing
- 🔍 Real-time search with popup suggestions
- ❤️ Add to favorites
- 📌 Add to personal list
- 👁️ Detailed content pages
- ▶️ Trailer playback (YouTube embed)
- 🌙 Modern dark UI
- ⚡ Performance-oriented architecture

---

## 🏠 Home Page

The home page welcomes users with featured content and smoothly scrollable sections, providing a fast and immersive discovery experience.

<!-- 🏠 HOME PAGE GIF -->
![Cineva Home](ts-project/public/gifs/home.gif)

---

## 🎥 Movies & TV Shows (Categories)

Users can browse movies and TV shows through categorized sections, making it easy to discover content by type and interest.

<!-- 🎥 MOVIES & SERIES PAGE GIF -->
![Cineva Categories](ts-project/public/gifs/filmler.gif)

---

## 🔍 Search Experience

Cineva provides a real-time search experience through the header input.  
While typing, a popup displays instant results, and users can navigate to the full search page via the **"Search more"** action.

<!-- 🔎 SEARCH GIF -->
![Cineva Search](ts-project/public/gifs/4.gif)

---

## 🎬 Movie / TV Show Details

Each detail page presents comprehensive information about the selected content, including trailers and user actions.

- Overview and description
- Rating information
- Trailer playback
- Favorite and list actions

<!-- 🎞️ DETAILS PAGE GIF -->
![Cineva Details](ts-project/public/gifs/2.gif)

---

## 🛠️ Tech Stack

### Frontend
- **React**
- **React Query** (client-side caching & persistence)
- Component-based UI architecture

### Backend
- **Node.js**
- **Express.js**
- RESTful API design

### Cloud & Services
- **AWS**
  - Media and asset handling
  - Scalable infrastructure

---

## ⚙️ Installation & Setup

### Clone the repository
```bash
git clone https://github.com/your-username/cineva.git
cd cineva
Backend
cd backend
npm install
npm run dev
Frontend
cd frontend
npm install
npm run dev
```
---

## 🧠 Architecture Notes

- Client-side caching and session persistence are used to reduce unnecessary network requests
- Optimized API consumption for improved performance
- Clear separation of concerns between frontend and backend
- Scalable and maintainable project structure
