# EcoLoop AI — Smart Waste-to-Supplier Marketplace

A full-stack MERN starter project for identifying waste, creating collection requests, connecting users with recyclers/suppliers, tracking pickups, and awarding eco-points.

## Features
- React + Vite responsive sustainability dashboard
- Express REST API with JWT authentication
- MongoDB/Mongoose data models
- Waste report creation with image upload
- Demo image classification endpoint (rule-based fallback, ready to replace with a vision API)
- Collection requests and supplier acceptance
- Supplier listings and offers
- User dashboard, impact metrics, collection history, eco-points
- Role-based user/supplier/admin structure
- Seed/demo mode for trying the UI without configuring MongoDB
- Input validation, password hashing, basic rate limiting, Helmet, CORS

## Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas connection string

## Run locally
1. Extract the ZIP.
2. Copy `server/.env.example` to `server/.env` and set `MONGO_URI` and `JWT_SECRET`.
3. In a terminal:
   ```bash
   cd server
   npm install
   npm run dev
   ```
4. In another terminal:
   ```bash
   cd client
   npm install
   npm run dev
   ```
5. Open the Vite URL printed in the terminal (usually `http://localhost:5173`).

The client API URL defaults to `http://localhost:5000/api`.

## Demo mode
The frontend includes clearly illustrative preview cards and metrics so you can explore the design before connecting. Authentication and persistent write operations require MongoDB. For the full workflow, configure MongoDB and register a user.

## Register
Use the app's Sign up screen and choose either **Resident** or **Recycler / Supplier**. Keep credentials for future logins.

## API overview
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET /api/waste/categories`
- `POST /api/waste/classify` (image upload; demo classifier)
- `GET /api/collections`
- `POST /api/collections`
- `PATCH /api/collections/:id/accept`
- `PATCH /api/collections/:id/status`
- `POST /api/collections/:id/offers`
- `GET /api/suppliers`

## AI classification note
The included classifier is a **demo heuristic**, not a trained computer-vision model. It accepts an uploaded image and returns a suggested category based on the optional filename and a safe fallback. For real image recognition, replace `server/src/services/classifier.js` with a call to a vision model/API and set its credentials in `.env`. The user should always confirm the category before disposal.

## Production checklist
- Use HTTPS and strong unique secrets.
- Configure an explicit CORS origin.
- Add email verification, password reset, upload scanning, image storage (S3/Cloudinary), audit logging, and automated tests.
- Replace local disk uploads with durable object storage.
- Review privacy, local waste regulations, supplier verification, and collection safety.
