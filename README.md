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

### Backend (`.env` in `backend/`)
```env
MONGO_URI=mongodb://localhost:27017/chatapp
PORT=3002
secret_key=replace_this_with_strong_secret
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NODE_ENV=development
```

**For Production (Render):**
- `MONGO_URI`: Your MongoDB Atlas connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/chatapp`)
- `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
- `secret_key`: Strong random secret for JWT signing
- `NODE_ENV=production`

### Frontend (`.env` in `frontend/`)
Optional Vite-style env vars:
```env
VITE_API_BASE=http://localhost:3002
```

**For Production (Vercel):**
- `VITE_API_BASE`: Your Render backend URL (e.g., `https://your-backend.onrender.com`)

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

## Deployment

### Backend on Render
1. Connect your GitHub repository to Render
2. Create a new **Web Service**
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `FRONTEND_URL`: Your Vercel frontend URL
   - `secret_key`: Strong JWT secret
   - `NODE_ENV=production`
   - Cloudinary credentials (if using)
6. Render will auto-assign `PORT` - no need to set it

### Frontend on Vercel
1. Connect your GitHub repository to Vercel
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable:
   - `VITE_API_BASE`: Your Render backend URL
6. Deploy

### MongoDB Atlas Setup
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist IP addresses (or use `0.0.0.0/0` for Render)
4. Get connection string and use as `MONGO_URI`

## Additional Notes
- Ensure MongoDB is seeded with problems/submissions as needed.
- CORS is configured to allow both localhost (dev) and your production frontend URL.
- Health check endpoint available at `/health` for monitoring.

