M-TECH

M-TECH is a cross-platform mobile application designed to digitize and centralize the management of technical interventions in maintenance workshops. It enables real-time synchronization between field technicians and central administration, replacing manual and paper-based tracking systems with a streamlined, digital workflow.

🚀 Key Features

Secure Authentication: Token-based session management using JWT (JSON Web Tokens).

Role-Based Access Control: Distinct interfaces and permissions tailored for Technicians and Administrators.

Intervention Management: Technicians can view assigned tasks, check vehicle details, and update statuses (e.g., Not Started, In Progress, Paused, Completed).

Real-Time Time Tracking: Integrated timers to track active work time, pause durations, and total intervention time.

Digital Reporting: Technicians can submit detailed intervention reports, log issues, and attach necessary documentation directly from the field.

Offline Mode: Users can continue filling out reports in areas without network coverage, with automatic data synchronization triggering once the connection is restored.

🛠️ Tech Stack

Frontend: React Native, TypeScript

Backend: Node.js, Express.js

Database: MySQL

Security: JWT, bcryptjs

Infrastructure: Docker (for microservices containerization)

🗄️ Database Architecture

The system relies on a structured relational database architecture:

Users: Stores user credentials, hashed passwords, and role definitions.

Operations / Orders: Contains work order details, current statuses, deadlines, and assigned equipment.

History / Logs: Tracks user actions and status updates for auditing and performance tracking purposes.

⚙️ Installation & Setup

Prerequisites

Node.js

MySQL Server

React Native development environment (Android Studio / Xcode)

Backend Setup

Navigate to the server/ directory.

Install dependencies:

npm install jsonwebtoken bcryptjs express cors helmet


Configure environment variables in a .env file (Database credentials, JWT Secret, etc.).

Start the API server:

npm run dev


Frontend Setup

Navigate to the client/ directory.

Install dependencies:

npm install


Run the application on a simulator or physical device:

Android:

npx react-native run-android


iOS:

npx react-native run-ios


👨‍💻 Author

Mohammed Benbrahim