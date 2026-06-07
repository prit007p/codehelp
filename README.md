# CodeHelp

CodeHelp is a full-stack coding platform with problem solving, code execution, user profiles, discussions, 1-on-1 chat, and an AdminJS dashboard.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Clerk, Socket.IO client
- Backend: Node.js, Express, MongoDB, Mongoose, Clerk, Socket.IO, AdminJS
- Code execution: Self-hosted Piston API with Docker
- Storage/signatures: Cloudinary

## Features

- Clerk-based authentication
- Protected problem, submission, profile, and chat routes
- Online code execution through Piston
- Problem discussions and personal chat
- User profiles with submissions and solved problem stats
- AdminJS dashboard for managing app data
- Production deployment support with Nginx, PM2, Docker, and AWS EC2

## Project Structure

```txt
codehelp/
  backend/
    app.js
    models/
    routes/
    other/
    package.json
    .env.example
  frontend/
    src/
    public/
    package.json
    .env.example
```

## Prerequisites

- Node.js 20+
- npm
- MongoDB Atlas database
- Clerk application
- Docker, required for Piston
- Cloudinary account, required for profile image upload signatures

## Environment Variables

Create `backend/.env`:

```env
NODE_ENV=development
PORT=3002

FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3002

MONGO_URI=your_mongodb_connection_string

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

PISTON_API_URL=http://127.0.0.1:2000/api/v2

ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
ADMIN_COOKIE_SECRET=generate_a_long_random_secret

CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3002
VITE_SOCKET_URL=http://localhost:3002
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Never commit real `.env` files or secret keys.

## Clerk Setup

1. Create an application in the Clerk dashboard.
2. Copy the publishable key into both:
   - `backend/.env` as `CLERK_PUBLISHABLE_KEY`
   - `frontend/.env` as `VITE_CLERK_PUBLISHABLE_KEY`
3. Copy the secret key only into:
   - `backend/.env` as `CLERK_SECRET_KEY`
4. Add your frontend URL to Clerk allowed origins and redirect URLs.

For local development:

```txt
http://localhost:3000
```

For AWS/IP deployment:

```txt
http://your-ec2-public-ip
```

## Piston Setup

The public Piston API may reject requests, so this project expects a self-hosted Piston instance.

Start Piston locally:

```bash
docker volume create piston_data

docker run \
  --privileged \
  -v piston_data:/piston \
  -dit \
  -p 127.0.0.1:2000:2000 \
  --restart unless-stopped \
  --name piston_api \
  ghcr.io/engineer-man/piston
```

Install runtimes:

```bash
git clone https://github.com/engineer-man/piston.git /tmp/piston
cd /tmp/piston/cli
npm install
node index.js -u http://127.0.0.1:2000 ppman install python=3.10.0 node=18.15.0 gcc=10.2.0 java=15.0.2
```

Check runtimes:

```bash
curl http://127.0.0.1:2000/api/v2/runtimes
```

## Run Locally

Start backend:

```bash
cd backend
npm install
npm run dev
```

Start frontend:

```bash
cd frontend
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

Backend runs on:

```txt
http://localhost:3002
```

Admin dashboard:

```txt
http://localhost:3002/admin
```

## Production Build

Build frontend:

```bash
cd frontend
npm install
npm run build
```

Start backend with PM2:

```bash
cd backend
npm install
pm2 start app.js --name codehelp-backend
pm2 save
```

## AWS EC2 Deployment Notes

Recommended simple deployment:

- EC2 Ubuntu server
- Nginx serves frontend static files
- PM2 runs backend on port `3002`
- Docker runs Piston on `127.0.0.1:2000`
- MongoDB Atlas hosts the database

Security group:

- Open `22` only for your IP
- Open `80` for public HTTP
- Open `443` for HTTPS after adding a domain/certificate
- Do not expose `3002`
- Do not expose `2000`

Backend production `.env` example:

```env
NODE_ENV=production
PORT=3002
FRONTEND_URL=http://your-ec2-public-ip
ADMIN_URL=http://your-ec2-public-ip
PISTON_API_URL=http://127.0.0.1:2000/api/v2
```

Frontend production `.env` example:

```env
VITE_API_URL=http://your-ec2-public-ip
VITE_SOCKET_URL=http://your-ec2-public-ip
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Example Nginx site:

```nginx
server {
    listen 80;
    server_name your-ec2-public-ip;

    root /var/www/codehelp;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3002/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /admin/ {
        proxy_pass http://127.0.0.1:3002/admin/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:3002/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location / {
        try_files $uri /index.html;
    }
}
```

Copy the frontend build for Nginx:

```bash
sudo mkdir -p /var/www/codehelp
sudo rsync -a --delete frontend/dist/ /var/www/codehelp/
sudo chown -R www-data:www-data /var/www/codehelp
sudo nginx -t
sudo systemctl reload nginx
```

## Updating The Deployed Site

Push locally:

```bash
git push origin main
```

Pull and update on the EC2 server:

```bash
cd ~/codehelp
git pull origin main

cd backend
npm install
pm2 restart codehelp-backend --update-env
pm2 save

cd ../frontend
npm install
npm run build
sudo rsync -a --delete dist/ /var/www/codehelp/
sudo chown -R www-data:www-data /var/www/codehelp
sudo systemctl reload nginx
```

## Useful Commands

Check backend:

```bash
pm2 status
pm2 logs codehelp-backend --lines 50
```

Check Nginx:

```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -n 50 /var/log/nginx/error.log
```

Check Piston:

```bash
docker ps
curl http://127.0.0.1:2000/api/v2/runtimes
```

## Security Notes

- Rotate any secret that was pasted into chat, screenshots, commits, or logs.
- Keep Clerk secret keys only on the backend.
- Use a long random `ADMIN_COOKIE_SECRET` in production.
- Keep MongoDB Atlas network access restricted when possible.
- Use HTTPS before a real production launch.
- Change the default admin password before sharing the site.
