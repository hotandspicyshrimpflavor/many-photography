# Many's Photography

Award-winning photography portfolio with interactive 3D spinning wheel and secure client portal.

![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat&logo=three.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

## 🎡 Features

### Interactive Spinning Wheel Portfolio
- Three.js powered 3D spinning wheel
- GSAP physics-based spin animation
- Category-based gallery exploration
- Award-worthy visual experience

### Client Portal
- Token-based authentication (no passwords)
- Token format: `NAME-YYYY-MM-DD` (e.g., `JOHN DOE-2024-06-15`)
- Web quality downloads (watermarked)
- Print quality requests (admin approved)

### Copyright Protection
- Dynamic watermarking with Sharp
- Steganographic invisible watermarks
- Signed expiring URLs for all assets
- Disable right-click, drag, DevTools detection
- Full audit logging of all downloads

### Admin Dashboard
- Client management
- Gallery creation and upload
- Token generation
- Download monitoring

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Local Development

```bash
# Clone the repository
git clone https://github.com/hotandspicyshrimpflavor/many-photography.git
cd many-photography

# Copy environment file
cp .env.example .env
# Edit .env with your values

# Start infrastructure services
docker-compose up -d postgres minio

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Production Deployment

```bash
# Build the Docker image
docker build -t many-photography .

# Deploy with docker-compose
docker-compose up -d
```

## 🏠 Home Server Setup

See the [Home Server Setup Guide](./docs/HOME_SERVER_SETUP.md) for complete instructions on setting up:

- Ubuntu Server 24.04 LTS
- Docker + Docker Compose
- PostgreSQL + MinIO (S3-compatible storage)
- Cloudflare Tunnel (no port forwarding!)
- Automated backups

## 📁 Project Structure

```
many-photography/
├── src/
│   ├── app/                 # Next.js 14 App Router
│   │   ├── (public)/       # Public pages
│   │   ├── portal/          # Client portal
│   │   ├── admin/           # Admin dashboard
│   │   └── api/             # API routes
│   ├── components/
│   │   ├── wheel/           # Three.js spinning wheel
│   │   ├── gallery/         # Masonry + lightbox
│   │   ├── watermark/       # Sharp watermark pipeline
│   │   └── ui/              # Design system
│   ├── lib/
│   │   ├── db.ts            # Prisma client
│   │   ├── minio.ts         # S3 client
│   │   ├── resend.ts        # Email client
│   │   └── auth.ts          # Token utilities
│   └── emails/              # React Email templates
├── prisma/
│   └── schema.prisma        # Database schema
├── docs/                     # Documentation
├── docker-compose.yml        # Production stack
└── Dockerfile
```

## 🔐 Security

- All images served via signed, expiring URLs
- Tokens hashed with bcrypt (12 rounds)
- Rate limiting on token verification (5 attempts → 15min lockout)
- Download audit logging (IP, timestamp, files)
- Admin requires 2FA (TOTP)
- No direct image paths exposed

## 📧 Email

Transactional emails via Resend:

- Token delivery notification
- Download reminder (7 days before expiry)
- Print quality request received
- Print quality ready

## 🏆 Awards

This site is built to be award-worthy:
- Awwwards submission ready
- CSS Design Awards submission ready
- Lighthouse 90+ performance target

## 📝 License

Private - All rights reserved.
© Many's Photography

---

Built with 🌙 by xiao (AI Assistant)
