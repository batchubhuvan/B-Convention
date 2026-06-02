# 🏰 B Convention | Premium Wedding Hall Scheduler & Billing System

A premium, glassmorphic scheduling and financial management dashboard designed specifically for **B Convention**. This system handles complex logistics, multi-admin session tracking, and wedding hall billing.

---

## 🌟 Why Use B Convention Scheduler?

Managing a high-end wedding convention hall requires high precision. Standard spreadsheets lead to conflicts, double bookings, and billing errors. **B Convention** solves this with a custom, feature-rich web portal:

### 1. Conflict-Free Booking Calendar
* **Shift blockouts:** Supports three booking slots: **Morning Shift (5 AM - 4 PM)**, **Night Shift (4 PM - 11 PM)**, and **Full Day (Marriage)**.
* **Smart scheduling guard:** Automatically blocks "Full Day" if a shift is already taken, and locks out individual shifts if a full day is booked, preventing double-booking conflicts.
* **Premium visual cues:** Standard color-coded badges (Green: Completed, Amber: Booked, Purple: Full Day) map out the month at a glance.

### 2. Strict Single-Session Security Rules
* **Owner exclusivity:** The Main Admin (Owner) has a strict single-session rule. If the owner logs in on a new device or tab, previous sessions are terminated immediately.
* **Broadcast synchronizer:** Uses HTML5 `BroadcastChannel` to coordinate sessions across multiple browser tabs in real-time.
* **Sub-Admin tracker:** Supports up to 4 Sub-Admins. Shows their real-time online status and logs their active duration.

### 3. Financial Subdivisions & Rules
* **Itemized Billing:** Splits bookings into **Hall Rent**, **Power/Electricity**, **Cleaning Fees**, **AC Charges**, and **Guest Rooms**.
* **Compulsory 20% Advance Rule:** Imposes a strict policy requiring a minimum of **20% advance payment** of the total payable amount before a booking can be confirmed.
* **Live Calculations:** Dynamically computes subtotals, payable values, discounts, and outstanding balances in real-time.

### 4. Secure 90-Day Recycle Bin
* **Accidental deletion guard:** Deleted bookings are moved to a sandboxed Recycle Bin with an active countdown timer.
* **Grace period:** Bookings can be restored back to the live calendar within **90 days** before they are permanently purged.

### 5. Rich, Dynamic Aesthetics
* **Premium Gold Spark Particles:** Features a responsive HTML5 canvas particle backdrop that drifts dynamically based on mouse movements.
* **Confetti Burst Hook:** Triggers a custom confetti physics burst upon completing or saving a new booking!

---

## 🚀 How to Use the App

### 📦 Setup & Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

1. **Clone or navigate** to the project workspace root:
   ```bash
   cd "B Convention Project (1)"
   ```
2. **Install dependencies** (already completed):
   ```bash
   npm install
   ```

### 💻 Development & Building
* **Start the development server:**
  ```bash
  npm run dev
  ```
  The server starts at `http://localhost:3000` and automatically opens in your default browser.
  
* **Build for production:**
  ```bash
  npm run build
  ```
  This compiles the app into highly optimized HTML, JS, and CSS chunks in the `/dist` directory.

---

## 🔑 Login & Setup Instructions

The application runs on secure global credentials:
* **Global Username:** `B Convention`
* **Security Password:** `Brp@2856`

### 1. First-Time Setup
* The **first person** to log in using the global credentials and entering their personal name becomes the **permanent Main Admin (Owner)**.
* The owner's name is saved securely in local database storage.

### 2. Sub-Admin Access
* Up to 4 other users can sign in using the global credentials by entering their unique personal names.
* They are registered as **Sub-Admins**.
* Sub-Admins cannot access settings, clear sub-admin slots, or change global branding parameters.

---

## 🛠️ Technology Stack
* **Bundler & Server:** Vite
* **Frontend Library:** React 18
* **State Management:** Zustand 4 (lightweight, persistent state store)
* **Routing:** React Router v7
* **Database & Persistence:** LocalStorage & SessionStorage API
* **Design System:** Custom CSS Custom Properties (Vanilla CSS variables)
