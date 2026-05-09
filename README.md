# Royal Gems Institute

A modern e-commerce platform for gemstone and jewellery products built with **Next.js 15**, **Supabase**, and **PayHere** payment gateway.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase account
- PayHere merchant account (for payments)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Gems_Final
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   PAYHERE_MERCHANT_ID=your_merchant_id
   PAYHERE_MERCHANT_SECRET=your_merchant_secret
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development
   IS_SANDBOX=true
   ```

4. **Set up Supabase**

   - Run the migrations in `supabase/migrations/`
   - Configure storage buckets: `npx tsx scripts/setup-storage.ts`
   - Seed sample data: `npx tsx scripts/seed-database.ts`

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
├── app/                    # Next.js 15 App Router
│   ├── admin/              # Admin panel pages
│   ├── api/                # API routes
│   ├── about/              # About page
│   ├── academy/            # Academy page
│   ├── collection/         # Collection/shop page
│   ├── gems/               # Gem detail pages
│   ├── jewellery/          # Jewellery pages
│   └── payment/            # Payment flow pages
├── components/             # React components
│   └── ui/                 # shadcn/ui primitives
├── lib/                    # Core business logic
│   ├── auth/               # Authentication services
│   ├── database/           # Schema & setup
│   ├── payhere/            # Payment gateway config
│   ├── repositories/       # Data access layer
│   └── security/           # Security utilities
├── supabase/               # Database migrations & schema
├── scripts/                # Utility scripts
├── types/                  # TypeScript type definitions
├── utils/                  # Client-side utilities
├── public/                 # Static assets
└── __tests__/              # Test suite
```

---

## Security Features

- **Authentication**: Supabase Auth with SSR support
- **Authorization**: Role-based access control (SuperAdmin, Admin, Moderator)
- **Password Policy**: Min 12 chars, uppercase, lowercase, number, special char
- **2FA**: TOTP via Google Authenticator
- **CSRF Protection**: Token-based validation
- **Session Management**: JWT access (15m) + refresh (7d) with rotation
- **Audit Logging**: Admin actions tracked with timestamp, IP, and user agent
- **Input Sanitization**: XSS prevention helpers
- **File Upload Security**: Type/size validation with random filenames

---

## Admin Panel

Access at `/admin/login`

- **Dashboard** — Statistics overview
- **User Management** — Search, create, suspend, change roles
- **Gem Management** — Add, edit, delete, approve listings
- **Jewellery Management** — Manage jewellery products
- **Order Management** — Track, refund, cancel orders
- **Audit Logs** — Security event viewer
- **Settings** — Security & role configuration (SuperAdmin)

---

## Payment Integration

Uses PayHere payment gateway:

- Sandbox mode for testing (`IS_SANDBOX=true`)
- Production mode for live payments
- Webhook support for payment verification
- Order status tracking

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |

## Database Scripts

| Command | Description |
|---------|-------------|
| `npx tsx scripts/setup-storage.ts` | Set up Supabase storage buckets |
| `npx tsx scripts/seed-database.ts` | Seed database with sample data |
| `node scripts/create-admin.js` | Create admin user |

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Production Environment Variables

- Use production Supabase credentials
- Set `NODE_ENV=production`
- Set `IS_SANDBOX=false` for live payments
- Update `NEXT_PUBLIC_BASE_URL` and `FRONTEND_URL` to your domain

---

## Testing

```bash
npm test
```

Tests are organized under `__tests__/`:
- `api/` — API route tests
- `components/` — Component unit tests
- `integration/` — End-to-end flow tests
- `repositories/` — Data layer tests

---

## License

All rights reserved.
