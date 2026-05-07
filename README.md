# Veloura Commerce

Production-oriented fashion e-commerce platform inspired by Zara merchandising and Nike-style movement. Built with Angular standalone components, Tailwind CSS, Angular Signals, Express, MongoDB/Mongoose, JWT auth, a complete order lifecycle, and behavior-based recommendations.

## What Is Included

- Full storefront: home, catalog, product detail, cart, checkout, confirmation, account order history.
- Conversion UX: sticky add-to-cart, low-stock urgency, ratings/reviews, trust badges, skeleton loading, toasts, hover image swap, dark mode.
- Admin dashboard: sales stats, product CRUD, order management, user list.
- Backend REST API: auth, products, cart sync, orders, reviews, coupons, interactions, recommendations.
- AI recommendation logic: recently viewed, frequently bought together, similar products, trending products, recommended for you.
- Payment structure: cash on delivery by default, Stripe-ready payment method field and env placeholder.
- Bonus systems: reviews, coupons, mock email notifications, pagination, optimized lazy image loading.

## Project Structure

```text
frontend/
  src/app/core/        API services, auth, cart state, models, guards
  src/app/shared/      navbar, product cards, rails, skeletons, toasts
  src/app/features/    storefront flows
  src/app/admin/       admin dashboard and management screens

backend/
  src/controllers/     route handlers
  src/models/          Mongoose schemas
  src/routes/          REST API routes
  src/services/        recommendations and mock email logic
  src/middleware/      auth and error middleware
```

## Local Setup

### 1. MongoDB

Use local MongoDB:

```bash
mongod
```

Or create an Atlas cluster and copy the connection string.

For this workspace, a portable MongoDB binary was downloaded under `.tools/` and started with data stored in `backend/.data/mongo`. Both folders are ignored by Git.

### 2. Backend

```bash
cd backend
npm install
copy .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/veloura
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:4200
ADMIN_REGISTRATION_CODE=change-me-admin-code
STRIPE_SECRET_KEY=
```

Seed products, coupons, and an admin user:

```bash
npm run seed
```

Run the API:

```bash
npm run dev
```

If you are using the portable MongoDB in this workspace, start it first from the repo root:

```powershell
Start-Process -WindowStyle Hidden -FilePath ".tools\mongodb\mongodb-win32-x86_64-windows-8.2.5\bin\mongod.exe" -ArgumentList '--dbpath="backend\.data\mongo" --bind_ip 127.0.0.1 --port 27017'
```

Admin seed login:

```text
admin@veloura.local
AdminPass123!
```

### 3. Frontend

```bash
cd frontend
npm install
ng serve
```

Open `http://localhost:4200`.

For production API URL, update `frontend/src/environments/environment.prod.ts`.

## Core API Endpoints

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`

Products:

- `GET /api/products`
- `GET /api/products/:idOrSlug`
- `POST /api/products` admin
- `PUT /api/products/:id` admin
- `DELETE /api/products/:id` admin
- `GET /api/products/:id/reviews`
- `POST /api/products/:id/reviews`

Cart:

- `GET /api/cart`
- `PUT /api/cart/sync`
- `POST /api/cart/items`
- `PUT /api/cart/items/:itemId`
- `DELETE /api/cart/items/:itemId`

Orders:

- `POST /api/orders`
- `GET /api/orders/user`
- `GET /api/orders/admin`
- `GET /api/orders/:id`
- `PUT /api/orders/:id/status`

AI and conversion tracking:

- `POST /api/interactions`
- `GET /api/recommendations/:userId`

Coupons and admin:

- `POST /api/coupons/apply`
- `GET /api/stats`
- `GET /api/users`

## Deployment

### Frontend on Vercel

Use `frontend/` as the project root.

- Build command: `npm run build`
- Output directory: `dist/veloura-storefront/browser`
- Install command: `npm install`

Set the production API URL in `frontend/src/environments/environment.prod.ts` before deploying, for example:

```ts
apiUrl: 'https://veloura-api.onrender.com/api'
```

`frontend/vercel.json` includes SPA rewrites so routes like `/checkout` and `/admin/orders` refresh correctly.

### Backend on Render or Railway

Use `backend/` as the service root.

- Build command: `npm install`
- Start command: `npm start`
- Runtime: Node.js 20+

Environment variables:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=long-random-production-secret
CLIENT_URL=https://your-vercel-app.vercel.app
ADMIN_REGISTRATION_CODE=private-admin-code
STRIPE_SECRET_KEY=sk_live_or_test_key_when_ready
```

Run `npm run seed` once against the production database if you want starter catalog data.

## Verification

The current workspace was checked with:

```bash
npm --prefix backend audit --audit-level=moderate
node -e "require('./backend/src/app'); console.log('app loaded')"
npm --prefix frontend run build
```
