🏥 Hospital Tracker

Hospital Tracker is a full-stack healthcare management platform that connects patients and doctors in a seamless digital environment. The platform enables appointment scheduling, real-time communication, telemedicine consultations, and health metric tracking.

It aims to improve healthcare accessibility by allowing patients and doctors to interact remotely while maintaining secure and efficient medical record tracking.

🌟 Features
🔐 User Authentication

Secure registration and login for both Patients and Doctors.

JWT-based authentication for session management.

Password encryption using bcrypt.

Role-based access control to ensure proper user permissions.

👨‍⚕️ Role-Based Dashboards
Patient Dashboard

Patients can:

View available doctors

Book appointments

Cancel scheduled appointments

Chat with doctors

Join video or voice consultations

View personal health metrics

Doctor Dashboard

Doctors can:

View upcoming patient appointments

Manage consultation schedules

Communicate with patients through chat

Start video or voice consultations

Track patient health metrics

📅 Appointment Management

The platform includes a simple appointment booking system.

Patients can:

Browse available doctors

Book appointments

Cancel appointments

Doctors can:

View their appointment schedule

Manage patient consultations efficiently.

💬 Real-Time Chat with Translation

Hospital Tracker includes real-time messaging between doctors and patients.

Features:

Instant communication using Socket.io

Secure doctor–patient messaging

Offline-capable language detection and translation

Improved accessibility for multilingual users

📹 Telemedicine (Video & Voice Calls)

The platform provides built-in telemedicine support.

Features:

Real-time video consultations

Real-time voice calls

Incoming call notifications

WebRTC-based peer-to-peer communication

Low-latency video and audio calls

📊 Integrated Disease Management (IDM)

The IDM Panel allows doctors to monitor and manage patient health metrics.

Doctors can record and track:

Blood pressure

Blood sugar

Other health metrics

Benefits:

Helps monitor chronic conditions

Enables data-driven healthcare decisions

Provides historical health tracking

Patients can view these health metrics in read-only mode.

🛠️ Tech Stack
Frontend

React 19 (Vite)

TailwindCSS v4

React Router DOM

Socket.io Client

WebRTC (simple-peer)

i18next (Localization)

Backend

Node.js

Express.js

MongoDB

Mongoose

Socket.io

Authentication & Security

JWT (JSON Web Tokens)

bcrypt

Additional Services

Nodemailer (Email services)

languagedetect (Offline translation support)

AI Integrations

@google/generative-ai

OpenAI APIs

🚀 Getting Started

Follow these instructions to set up the project locally.

Prerequisites

Make sure you have the following installed:

Node.js (v18 or higher)

MongoDB (local or MongoDB Atlas)

Git

1️⃣ Clone the Repository
git clone <your-repository-url>

cd Hospital-Tracker
2️⃣ Setup Backend

Navigate to the backend directory:

cd Backend

Install dependencies:

npm install

Create a .env file inside the Backend directory and add required variables:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

Start the backend server:

npm run dev
3️⃣ Setup Frontend

Open a new terminal and navigate to the frontend directory:

cd Frontend/Hospital_Tracker

Install dependencies:

npm install

Run the development server:

npm run dev

The frontend will run at:

http://localhost:5173
📖 How to Use the Platform
For Patients

Register or login as a Patient

Access the Patient Dashboard

Browse available doctors

Book an appointment

Start chat with your doctor

Join video or voice consultation

View your health metrics in the IDM panel

For Doctors

Register or login as a Doctor

Access the Doctor Dashboard

View scheduled patient appointments

Chat with patients

Start video or voice calls

Record and monitor patient health metrics in the IDM panel

📹 Project Demonstration

You can watch the full demonstration of the Hospital Tracker platform here:

Video Link
https://drive.google.com/file/d/1bhBwzMRjX--PWcJR4zvaqtFSTMaXPBid/view