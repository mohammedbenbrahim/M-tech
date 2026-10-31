<div align="center">

  <!-- You can add a logo image here -->
  <!-- <img src="path/to/your/logo.png" alt="M-TECH Logo" width="200"/> -->

  <h1>🛠️ M-TECH</h1>
  
  <p>
    <b>A cross-platform mobile application designed to digitize and centralize the management of technical interventions in maintenance workshops.</b>
  </p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
    <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </p>
</div>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Screenshots](#-screenshots)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Database Architecture](#-database-architecture)
- [Author](#-author)

---

## 🚀 About the Project

**M-TECH** replaces manual and paper-based tracking systems with a streamlined, digital workflow. It enables real-time synchronization between field technicians and the central administration. By leveraging modern mobile and web technologies, it ensures that workshop operations are tracked accurately, securely, and efficiently.


---

## ✨ Key Features

* **🔐 Secure Authentication:** Token-based session management using JWT (JSON Web Tokens).
* **👥 Role-Based Access Control:** Distinct interfaces and permissions tailored for Technicians and Administrators.
* **📋 Intervention Management:** View assigned tasks, check vehicle details, and update statuses (e.g., *Not Started, In Progress, Paused, Completed*).
* **⏱️ Real-Time Time Tracking:** Integrated timers to track active work time, pause durations, and total intervention time.
* **📝 Digital Reporting:** Submit detailed intervention reports, log issues, and attach necessary documentation directly from the field.
* **📴 Offline Mode:** Continue filling out reports in areas without network coverage. Data automatically syncs once the connection is restored.

---

## 💻 Tech Stack

### Frontend (Mobile App)
* **Framework:** React Native
* **Language:** TypeScript

### Backend (API)
* **Environment:** Node.js
* **Framework:** Express.js
* **Security:** JWT, bcryptjs, Helmet, CORS

### Database & Infrastructure
* **Database:** MySQL
* **Containerization:** Docker (Microservices deployment ready)

---

## 📂 Project Structure

```text
M_technicien/
│
├── client/                          # Frontend directory (React Native)
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   ├── screens/                 # App screens (Login, Dashboard, etc.)
│   │   ├── services/                # API communication services
│   │   └── App.js                   # Main application entry point
│   └── package.json                 
│
├── server/                          # Backend directory (Express.js)
│   ├── src/
│   │   ├── controllers/             # Business logic for routes
│   │   ├── routes/                  # Express API routes
│   │   ├── models/                  # DB models (MySQL interactions)
│   │   └── app.js                   # Main Express application
│   ├── .env                         # Environment variables (DB, JWT secrets)
│   └── package.json                 
│
└── README.md                        # Project documentation
```

---

## ⚙️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v16 or higher recommended)
* [MySQL Server](https://dev.mysql.com/downloads/mysql/)
* React Native development environment ([Android Studio](https://developer.android.com/studio) / [Xcode](https://developer.apple.com/xcode/))

### 1. Clone the Repository

```bash
git clone https://github.com/mohammedbenbrahim/m-tech.git
cd m-tech
```

### 2. Backend Setup

```bash
cd server
npm install
```
* Create a `.env` file in the `server` directory and add your MySQL database credentials and JWT Secret.
* Start the development server:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../client
npm install
```
* Run the application on your preferred platform:
```bash
# For Android
npx react-native run-android

# For iOS (Mac only)
npx react-native run-ios
```

---

## 🗄️ Database Architecture

The system relies on a structured relational database architecture to maintain data integrity:

* **`Users`:** Stores user credentials, hashed passwords (bcrypt), and role definitions.
* **`Operations` / `OR_tech`:** Contains work order details, current statuses, deadlines, and assigned equipment/vehicles.
* **`Logs`:** Tracks user actions and status updates for auditing and performance tracking purposes.

---

## 👨‍💻 Author

**Mohammed Benbrahim**
* GitHub: [@mohammedbenbrahim](https://github.com/mohammedbenbrahim)

---
<div align="center">
  <i>Created for the Auto Hall End-of-Studies Project</i>
</div>
