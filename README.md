# HabitFlow — MERN Stack Habit Tracker ⚡

A modern, responsive, full-stack Habit Tracker web application built with the **MERN** stack (MongoDB, Express, React, Node.js) and styled with **Tailwind CSS**.

![HabitFlow Preview](https://via.placeholder.com/800x400.png?text=HabitFlow+Preview)

## Features

* **User Authentication**: Secure registration and login using JWT (JSON Web Tokens) and bcrypt.
* **Dashboard & Checklists**: View today's tasks and mark them complete. Features a dynamic SVG completion ring.
* **Habit Management (CRUD)**: Create, view, edit, and delete daily and weekly habits freely.
* **Streaks Engine**: Automatically calculate your current and longest consecutive day streaks.
* **Progress & Analytics**: Visualize your performance with a GitHub-style activity heatmap, historical bar charts, and a streak trend line utilizing [Recharts](https://recharts.org/).
* **Beautiful UI/UX**: Designed with [Tailwind CSS v3](https://tailwindcss.com/) featuring dark mode, glassmorphic headers, smooth transitions, and animated states.
* **Toast Notifications**: Interactive feedback on every action via [React Hot Toast](https://react-hot-toast.com/).

## Tech Stack

### Frontend (Client)
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Recharts
- Context API (State Management)

### Backend (Server)
- Node.js
- Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- Bcrypt.js
- Dotenv & CORS

## Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or a local MongoDB server)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/habit-tracker.git
cd habit-tracker
```

### 2. Setup the Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder and add your variables:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
```
*(Make sure to whitelist your IP address in MongoDB Atlas Network Access!)*

Start the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend will start at `http://localhost:5173`.

## License
Built for educational purposes. Feel free to use and modify it.
