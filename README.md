# 📱 WhatsApp Payment Reminder Application

A fully autonomous, full-stack **MERN** (MongoDB, Express, React, Node.js) web application designed specifically to track monthly group payments and actively automate WhatsApp reminder messages on a specific date schedule.

## 🌟 Features Highlight
* **Dynamic WhatsApp Integration:** Directly hooks into WhatsApp to autonomously dispatch bulk reminder messages accurately.
* **Cron-Job Scheduler:** Automatically detects dates. It securely restricts reminder dispatches strictly between the 6th and 10th of every month. Automatic monthly resets trigger on the 1st of every month.
* **Highly Secure Authentication:** Complete JWT implementation using custom Username & Password constraints to guard the API payloads.
* **Cloud Persistence:** WhatsApp QR sessions are natively piped right into **MongoDB Atlas**, meaning your session effortlessly survives Cloud Host sleeping and restarting cycles.
* **Beautiful Dashboard:** 100% responsive, dark-themed, glassmorphic layout powered natively by React, layout transitions using Framer Motion, and Tailwind CSS.
* **Monolithic Cloud Build:** Designed to effortlessly deploy straight into Render using a single `render.yaml` configuration!

---

## 🛠️ Technology Stack
* **Frontend:** React, Tailwind CSS, Framer Motion, Lucide React, Axios.
* **Backend:** Node.js, Express.js
* **Database & Auth:** MongoDB, Mongoose, JSON Web Tokens (JWT)
* **Automation:** `node-cron`, `whatsapp-web.js`, `wwebjs-mongo` (Puppeteer Chromium architecture).
* **Deployment:** Render (acting as a monolith parsing statically built React assets).

---

## 🚀 Local Development Setup

To run this application efficiently on your local system, you must have NodeJS and MongoDB set up.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/saikiranbeesa/WhatsApp-Reminder-App.git
   ```

2. **Backend Configuration:**
   Inside the `backend/` folder, create a `.env` file with perfectly matching credentials layout:
   ```env
   JWT_SECRET=generate_a_random_secret_string
   ADMIN_USERID=your_desired_admin_email_or_username
   ADMIN_PASSWORD=your_super_secure_custom_password
   MONGO_URI=your_mongodb_atlas_connection_string
   ```

3. **Install Dependencies:**
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

4. **Boot the Node Engine!**
   - Start the backend via `cd backend && node server.js`.
   - On bootsup, a physical **QR Code** heavily formats into the terminal! Scan it via your WhatsApp Mobile App using "Linked Devices".
   - Start the Frontend Dashboard via `cd frontend && npm start`.

---

## ☁️ Cloud Deployment (Render.com)

This application has been meticulously pre-configured to utilize monolithic deployment architecture on **Render.com**. 

Render will intelligently detect the `render.yaml` file hosted at the root plane.
1. Connect you GitHub Repo to Render via **"New Web Service"**.
2. Supply your Environment Variables directly into Render's deployment dashboard.
3. The server natively executes `npm run build` targeting the React framework before wrapping the dependencies securely backward into Node.js space. 
4. **Enjoy** autonomous execution from a single monolithic domain!
