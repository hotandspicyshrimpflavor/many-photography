# Deployment Checklist — Many's Photography

## Pre-Launch Checklist

### ✅ Code & Repository
- [x] Repository created: `https://github.com/Hotandspicyshrimpflavor/many-photography`
- [x] All code committed and pushed
- [x] README with setup instructions
- [x] PRD and creative blueprint documented

### ✅ Core Features Built
- [x] Spinning wheel hero (Three.js + GSAP)
- [x] Design system (colors, typography, components)
- [x] Navigation + Footer
- [x] Featured work gallery
- [x] Testimonials section
- [x] Awards section
- [x] Client portal page (token login)
- [x] Token verification API
- [x] PostgreSQL schema (Prisma)
- [x] MinIO storage client
- [x] Resend email client
- [x] Auth utilities (token gen/verify)
- [x] Docker Compose setup
- [x] Dockerfile

### 🔲 Home Server Setup
- [ ] Hardware acquired (2nd hand PC)
- [ ] Ubuntu 24.04 LTS installed
- [ ] Docker + Docker Compose installed
- [ ] Firewall configured
- [ ] Cloudflare Tunnel set up
- [ ] Domain purchased (anydomain.com)
- [ ] DNS configured

### 🔲 Database & Storage
- [ ] PostgreSQL running (via Docker)
- [ ] Prisma schema pushed
- [ ] MinIO running (via Docker)
- [ ] Bucket created

### 🔲 Environment Variables
- [ ] `DATABASE_URL` set
- [ ] `MINIO_ACCESS_KEY` + `MINIO_SECRET_KEY` set
- [ ] `RESEND_API_KEY` set
- [ ] `CF_TUNNEL_TOKEN` set
- [ ] `ADMIN_EMAIL` + `ADMIN_PASSWORD` set
- [ ] `NEXT_PUBLIC_APP_URL` set (your domain)

### 🔲 Email
- [ ] Resend account created at [resend.com](https://resend.com)
- [ ] Domain verified (add DNS records)
- [ ] First email sent (test token delivery)

---

## Cloudflare Tunnel Setup (Step-by-Step)

### Step 1: Create Cloudflare Account
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Sign up for free
3. Add a website (domain) — you can buy one through Cloudflare or transfer

### Step 2: Create a Tunnel
1. Go to **Zero Trust** (in sidebar)
2. Click **Networks** → **Tunnels**
3. Click **Create a tunnel**
4. Select **Cloudflared** connector
5. Name it: `many-photography-tunnel`
6. Click **Save tunnel**

### Step 3: Configure the Tunnel
1. You'll see a **Tunnel Token** — copy it
2. In your server's `.env` file, set:
   ```
   CF_TUNNEL_TOKEN=paste-your-token-here
   ```
3. On your server, run:
   ```bash
   cloudflared service install YOUR_TOKEN_HERE
   ```

### Step 4: Set Up DNS
1. In Cloudflare dashboard → your domain → **DNS** → **Records**
2. Click **Add record**:
   - **Type:** CNAME
   - **Name:** @ (or `www`)
   - **Target:** `your-tunnel-id.cfargotunnel.com`
   - **Proxy status:** Proxied (orange cloud)
3. Click **Save**

### Step 5: Force HTTPS
1. Go to **SSL/TLS** → **Overview**
2. Set to **Full** or **Full (strict)**

---

## Domain Setup

### Buy a Domain
Recommended registrars:
- **Cloudflare Registrar** (best value, $8-10/year for .com)
- **Namecheap** (cheap, good interface)
- **Google Domains** (now Squarespace)

Suggested domains:
- `manyphotography.com` (taken likely)
- `manyphoto.com`
- `many-photography.com`
- `yournamephotography.com`

### Add DNS Records

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | @ | `your-tunnel-id.cfargotunnel.com` | Proxied |
| CNAME | www | @ | Proxied |
| TXT | @ | (Cloudflare verification) | DNS only |

Wait 5-10 minutes for DNS to propagate.

---

## First-Time Server Setup

Once you have your server and domain:

```bash
# 1. SSH into your server
ssh many@your-server-ip

# 2. Clone the project
git clone git@github.com:Hotandspicyshrimpflavor/many-photography.git
cd many-photography

# 3. Set up environment
cp .env.example .env
vim .env   # Fill in all values

# 4. Start everything
docker compose up -d

# 5. Initialize database
docker compose exec web npx prisma generate
docker compose exec web npx prisma db push

# 6. Create admin account
docker compose exec web node scripts/create-admin.js

# 7. Check if it's running
curl http://localhost:3000
```

---

## Post-Launch

### Monitoring
- Set up Uptime Robot (free) to monitor your site
- Check Cloudflare analytics weekly
- Monitor Docker logs: `docker compose logs -f`

### Awards Submission
When ready for awards (after launch):

**Awwwards:**
1. Go to [awwwards.com/submit](https://awwwards.com/submit)
2. Submit your site URL
3. Write about the spinning wheel as the key innovation
4. Upload screenshots

**CSS Design Awards:**
1. Go to [cssdesignawards.com](https://cssdesignawards.com)
2. Submit your site

### SEO
- [ ] Add Google Analytics / Plausible Analytics
- [ ] Submit sitemap to Google Search Console
- [ ] Add Open Graph image (`public/og-image.png`)
- [ ] Create robots.txt

---

## Troubleshooting

### Site shows "Connection refused"
```bash
# Check if containers are running
docker compose ps

# Check logs
docker compose logs web

# Restart
docker compose restart
```

### Images not loading
```bash
# Check MinIO is running
docker compose ps minio

# Check MinIO logs
docker compose logs minio

# Verify bucket exists
docker compose exec minio mc ls local/
```

### Email not sending
```bash
# Check Resend API key is correct in .env
docker compose exec web env | grep RESEND

# Test email
docker compose exec web node scripts/test-email.js
```

---

*Ready to launch: 2026-04-14*
