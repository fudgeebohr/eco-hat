## <img src="https://unpkg.com/lucide-static@latest/icons/leaf.svg" width="26" height="20" /> ECO-HAT | Sustainability Portal

![MongoDB Atlas](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge\&logo=mongodb\&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge\&logo=express\&logoColor=%2361DAFB) ![React.js](https://img.shields.io/badge/react.js-%2320232a.svg?style=for-the-badge\&logo=react\&logoColor=%2361DAFB) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F.svg?style=for-the-badge\&logo=node.js\&logoColor=white)

## Description
ECO-HAT Sustainability Portal is a comprehensive full-stack web application designed to promote and manage eco-friendly initiatives and sustainable practices. The platform offers a secure, role-based ecosystem for administrators and regular users, featuring personalized dashboards, a gamified rewards system, and transparency logs to track sustainability items and efforts effectively.

![Showcase1](/public/Showcase/1.png)
![Showcase2](/public/Showcase/2.png)
![Showcase3](/public/Showcase/3.png)

---
## Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | ![React.js](https://img.shields.io/badge/react.js-%2320232a.svg?style=for-the-badge\&logo=react\&logoColor=%2361DAFB)  ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge\&logo=vite\&logoColor=white) | Component-based library for building fast, interactive user interfaces. |
||![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge\&logo=css3\&logoColor=white)|Custom Vanilla for fully responsive Mobile/Desktop design.|
||![Lucide React](https://img.shields.io/badge/Lucide_React-34D399?style=for-the-badge&logo=react&logoColor=white)|Clean, scalable vector icons designed for modern user interfaces. |
|**QR Scanning Engine**|![HTML5-QRCode](https://img.shields.io/badge/HTML5--QRCode-800000?style=for-the-badge&logo=qrcode&logoColor=yellow)|Lightweight and robust library used for end-to-end cross-platform QR code scanning via device cameras.
| **Frontend Routing** | ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white) | Declarative routing for navigating between app pages. |
| **API Client** | ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white) | Promise-based HTTP client to handle communication with the backend. |
| **Backend** | ![NodeJS](https://img.shields.io/badge/node.js-6DA55F.svg?style=for-the-badge\&logo=node.js\&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge\&logo=express\&logoColor=%2361DAFB) | Fast, minimalist web framework for building RESTful APIs. |
||![Mongoose](https://img.shields.io/badge/-Mongoose-000?\&logo=MongoDB\&logoColor=white\&s)|An ODM (Object Data Modeling) library for MongoDB to handle data validation and schema management.|
| **Database** | ![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-%234ea94b.svg?style=for-the-badge\&logo=mongodb\&logoColor=white) | NoSQL database with elegant object modeling and schema validation. |
| **Authentication & Security** | ![JWT](https://img.shields.io/badge/JSON_Web_Token-black?style=for-the-badge&logo=json-web-tokens&logoColor=F50057) | Secure, stateless authentication and session management mechanism. |
|| ![bcrypt.js](https://img.shields.io/badge/Bcrypt-Password\_Hashing-red?style=for-the-badge\&logo=letsencrypt\&logoColor=white) | Password hashing algorithm to secure user and admin credentials. |
|  | ![CORS](https://img.shields.io/badge/CORS-Configured-339933?style=flat-square\&logo=nodedotjs\&logoColor=white) | To securely allow the frontend to communicate with the Render-hosted API.  |
| **Deployment** | ![Render](https://img.shields.io/badge/Render-8D0AF9.svg?style=for-the-badge\&logo=render\&logoColor=white) | Cloud platform utilized for seamlessly deploying, hosting, and scaling the full-stack web application.|
---
## Key Features

### <img src="https://unpkg.com/lucide-static@latest/icons/user.svg" width="25" height="20" /> Student Features
* **Real-time Sustainability Dashboard:** Track live point balances, personal recycling contributions, and milestone progression.
* **Dynamic Leaderboard:** Compete in campus-wide recycling ranks with optional **Privacy Mode** toggles to protect user visibility.
* **Secure QR Reward Checkout Bag:** Queue selected school supplies (pens, notebooks, papers) and generate cryptographic transaction verification tokens.
* **Global Campus Transparency Report:** Instantly look up and maximize receipt audits directly from the settings panel to track the system's budget allocation.

### <img src="https://unpkg.com/lucide-static@latest/icons/lock.svg" width="25" height="20" /> Administrative Management Console
* **Unified Admin Control Board:** Track daily, weekly, and monthly bottle intake stats at a glance.
* **Live Stock Management Engine:** In-line editing tools to adjust item quantities, tied directly to inventory tracking.
* **Hardware-Fused QR Redemption Scanner:** Integrated device camera controller to verify student code generation packages, drop supply stocks, and log point deductions atomically on physical collection.
* **Shared Transparency Ledger Input Form:** Upload cash expenses (e.g., procurement of school items) using Base64 string document compilation. Accessible across all admin frames.

### <img src="https://unpkg.com/lucide-static@latest/icons/shield.svg" width="25" height="20" /> System Security & Optimization
* **Global Session Idle Tracker:** Root-level application monitor that handles automatic logouts after 15 minutes of inactivity to protect kiosks from unattended security breaches.
* **Atomic Database Operations:** Unified `$inc` and `$push` MongoDB handlers to eliminate race conditions, double-deductions, or ghost inventory hoarding.
* **Responsive UX Shortcuts:** Desktop sidebar navigation mapped to smooth-scrolling viewport anchors and visual element glow triggers.
---
## Project Structure

<a href="https://github.com/fugeebohr/eco-hat">
  <img src="https://img.shields.io/badge/FRONTEND-800000?style=for-the-badge&logo=github&logoColor=white" alt="Frontend Layout" /><img src="https://img.shields.io/badge/-ECO_HAT-D4AF37?style=for-the-badge&logoColor=black" alt="Project Accent" />
</a>

```
eco-hat/
├── public/                 # Static assets (favicons, etc.)
├── src/
│   ├── api.js              # Axios configuration and backend API endpoint definitions
│   ├── App.jsx             # Main application component and route definitions
│   ├── App.css / index.css # Global application styling
│   ├── index.jsx           # Entry point for the React application
│   ├── components/         # Reusable UI components
│   │   ├── IdleLogoutTimeout.jsx # Security component for clearing idle sessions
│   │   └── Sidebar.jsx           # Navigation sidebar component
│   └── pages/              # Application views mapped to routes
│       ├── AdminDashboard.jsx
│       ├── AdminLogin.jsx
│       ├── AdminRegister.jsx
│       ├── Dashboard.jsx
│       ├── Login.jsx
│       ├── Profile.jsx
│       ├── Register.jsx
│       ├── Rewards.jsx
│       └── RoleSelection.jsx
├── package.json            # Frontend dependencies and run scripts
└── package-lock.json       # Dependency tree lockfile
```

<a href="https://github.com/fugeebohr/ecohat-node">
  <img src="https://img.shields.io/badge/BACKEND-800000?style=for-the-badge&logo=github&logoColor=white" alt="Backend Layout" /><img src="https://img.shields.io/badge/-ECOHAT_NODE-D4AF37?style=for-the-badge&logoColor=black" alt="Project Accent" />
</a>

```
ecohat-node/
├── server.js               # Main Express server entry point and configuration
├── middleware/             # Custom Express middlewares
│   └── auth.js             # JWT verification and route protection middleware
├── models/                 # Mongoose database schemas
│   ├── Admin.js            # Administrator user schema
│   ├── Item.js             # Eco-item schema for tracking
│   ├── TransparencyLog.js  # Audit log schema for actions
│   └── User.js             # Standard user account schema
├── routes/                 # API route handlers
│   ├── auth.js             # Authentication routes (login, register)
│   └── profile.js          # User/Admin profile management routes
└── package.json            # Backend dependencies and run scripts
```