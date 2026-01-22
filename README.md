# Real-Time Chat Moderation and Monitoring System

A full-stack, AI-powered real-time chat moderation system that detects toxic, abusive, spammy, and unsafe messages, automatically rephrases them into polite alternatives, and provides an admin dashboard for moderation analytics and monitoring.

This project focuses on **guiding conversations toward respectful communication instead of only blocking messages**.

---

## ✨ Key Features

### User Chat
- Real-time chat using Socket.IO
- Instant moderation of messages
- Automatic polite rephrasing of toxic messages
- Support for English and Hinglish
- Spam and flooding detection

### Moderation Engine (FastAPI)
- REST API for message moderation
- Toxicity score generation
- High-severity message blocking
- Lightweight and fast inference

### Admin Dashboard
- Secure admin authentication
- Real-time moderation analytics
- Daily moderation trends
- Approved vs Rephrased vs Unmoderated messages
- Interactive charts and insights

---

## 🧠 System Architecture

User (React Chat UI)
|
v
Node.js + Socket.IO (Chat Server)
|
v
FastAPI (AI Moderation Service)
|
v
MongoDB (Logs & Analytics)
|
v
Admin Dashboard (React)

## 📁 Project Structure

Real-Time-Chat-Moderation/
│
├── fastapi/ # AI moderation service
│ ├── main.py
│ ├── requirements.txt
│ └── app/
│
├── fullstack/ # MERN application
│ ├── backend/ # Node.js + Express + Socket.IO
│ └── frontend/ # React (User Chat + Admin Dashboard)
│
├── README.md
└── .gitignore

## 🛠 Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Recharts

### Backend
- Node.js
- Express
- Socket.IO
- MongoDB

### AI Moderation
- FastAPI
- Python
- NLP / Toxicity Detection Models

---

## ⚙️ How to Run the Project (Step-by-Step)

### ✅ Prerequisites
Make sure you have:
- Node.js (v18+ recommended)
- Python (v3.9+)
- MongoDB (local or cloud)
- Git

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/dishamittalnitb/Real-time-chat-moderation-and-monitoring.git
cd Real-time-chat-moderation-and-monitoring

## 2️⃣ Run the FastAPI Moderation Service

cd fastapi
pip install -r requirements.txt
uvicorn main:app --reload

FastAPI server will run at:

http://127.0.0.1:8000

## 3️⃣ Run the Node.js Backend

Open a new terminal:

cd fullstack/backend
npm install
npm run dev


Backend runs at:

http://localhost:5001

## 4️⃣ Run the React Frontend

Open another new terminal:

cd fullstack/frontend
npm install
npm run dev


Frontend runs at:

http://localhost:5173

## 5️⃣ Access the Application

User Chat UI:
http://localhost:5173

Admin Dashboard:
http://localhost:5173/admin

## 🔐 Environment Variables

Create a .env file in the following locations.

Backend (fullstack/backend/.env)
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

FastAPI (fastapi/.env)
MODEL_NAME=detoxify

## 📊 Admin Dashboard Analytics

The admin dashboard provides:

Total messages moderated

Rephrased vs approved messages

High-toxicity days

Moderation effectiveness insights

## 🧪 Example Moderation Flow

Input: You are useless and annoying

Detection: Toxic language

Action: Rephrased

Output: I disagree with your approach.

## 🎯 Use Cases

Online chat applications

Educational discussion platforms

Workplace communication tools

Live streaming chat moderation

## 👨‍⚖️ Judges Note

This system demonstrates real-time AI moderation, ethical handling of user communication, and scalable system design, making it suitable for real-world deployment.

🚀 Future Enhancements

Image moderation

Multilingual support

Voice chat moderation

Docker & cloud deployment

Advanced ML models

👩‍💻 Author

Disha Mittal
B.Tech Computer Science & Engineering
MANIT Bhopal

GitHub: https://github.com/dishamittalnitb