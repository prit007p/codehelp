## Project Overview
Full-stack workspace combining a Node/Express backend (with MongoDB + Socket.IO) and a Vite/React frontend for collaborative problem solving, code execution, and discussion features.

## Prerequisites
- Node.js 18+
- npm 9+ (comes with Node)
- MongoDB running locally or accessible via connection string

## Setup
1. Clone or download this repository.
2. Install root dependencies (provides workspaces for both apps):
   ```
   npm install
   ```
3. Install service-specific dependencies if needed:
   ```
   cd backend && npm install
   cd ../frontend && npm install
   ```
4. Create environment files following the templates below.

## Environment Variables
Create `.env` in `backend/` with:
```
MONGO_URI=mongodb://localhost:27017/chatapp
PORT=3002
SECRET_KEY=replace_this_with_strong_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Optional frontend `.env` (Vite-style) if you need custom URLs:
```
VITE_API_BASE=http://localhost:3002
```

## Running the Backend
```
cd backend
npm run dev   # uses nodemon; npm start for plain node
```
The server listens on `http://localhost:3002` and expects MongoDB reachable via `MONGO_URI`.

## Running the Frontend
```
cd frontend
npm run dev
```
The Vite dev server (default `http://localhost:5173`) proxies API requests to `http://localhost:3002` per `package.json`.

## Additional Notes
- Ensure MongoDB is seeded with problems/submissions as needed.
- Socket.IO endpoints assume the frontend origin defined in `backend/app.js` (update as required).

