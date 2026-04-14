# Many's Photography — Creative Vision & Tech Blueprint

> 🔥 Hold tight — this is the award-winning blueprint

---

## 🏆 Design Philosophy

**"Cinematic stillness meets interactive theatre"**

Every scroll feels like a film frame. Every interaction is a micro-performance.
The spinning wheel isn't a gimmick — it's the photographer's eye finding the perfect moment.

---

## 🎡 Feature: The Spinning Wheel Portfolio

### Concept
A full-viewport 3D carousel where each "stop" is a work category (wedding, portrait, commercial, video).
Users spin the wheel like a slot machine — it decelerates with physics-based easing —
then lands on a category that expands into an immersive gallery.

**Why it works:**
- Memory-making — users *play* with the site, not just scroll
- Diggable — they spend more time, explore more
- Shareable — the wheel moment is screenshot-worthy

### Implementation
- **Three.js** for 3D wheel with realistic lighting and depth of field
- **GSAP** for physics-based spin animation with momentum + deceleration
- **Lenis** for smooth scroll within gallery sections
- Haptic-feel on mobile (vibration on stop)

### Fallback
CSS 3D transforms for low-power devices, static grid for no-JS

---

## 🎨 Design Language

### Color Palette
| Role | Color | Hex |
|------|-------|-----|
| Background | Rich Black | `#0A0A0A` |
| Surface | Charcoal | `#1A1A1A` |
| Primary | Warm Gold | `#C9A84C` |
| Accent | Dusty Rose | `#D4A5A5` |
| Text Primary | Off-White | `#F5F5F0` |
| Text Secondary | Warm Gray | `#8A8A7A` |

### Typography
- **Display / Headlines:** `Playfair Display` — editorial, cinematic
- **Body:** `DM Sans` — modern, readable
- **Monospace / Token:** `JetBrains Mono` — technical credibility

### Motion Philosophy
- Entrance: fade-up with stagger (80ms between items)
- Hover: subtle lift + glow
- Page transitions: cinematic dissolve (opacity crossfade 600ms)
- Spinning wheel: spring physics, 3-5 second spin with cubic-bezier deceleration

---

## 🔐 Token Auth System

### How it works
1. Many uploads photos for Client X
2. System generates a **Token** from:
   - Client's **full legal name** (as on ID)
   - **Date of first photo shoot** (YYYY-MM-DD)
   - Format: `NAME-FIRSTSHOOTDATE` → `JOHN DOE-2024-06-15`
   - Stored as hash (bcrypt/argon2) in DB
3. Client receives Token via email or SMS
4. Client visits site → enters Token → sees their private gallery
5. Token is single-use or time-limited (configurable)

### Why this is genius
- No email/password to forget
- High-entropy (full name + date = hard to guess)
- Tied to identity proof (ID name matches)
- Many controls expiry and access

### Download System
- Preview: watermarked, low-res thumbnails
- Download: requires re-verification (same Token or OTP)
- Quality options: Web (compressed, watermarked) vs Print (original, with visible watermark burned in)
- Optional: one-time download link via email (WeTransfer-style flow)

---

## 🛡️ Author Rights Protection

### Layers of protection

**1. Technical**
- No direct image URLs — all images served via signed, expiring URLs
- Images loaded via canvas + CORS restrictions
- `draggable="false"`, `oncontextmenu="return false"`, CSS `user-select: none`
- Disable DevTools detection (basic, not foolproof)

**2. Visual**
- Invisible watermark (steganography) burned into all delivered images
- Visible watermark on all preview images (Many's logo, corner)
- Thumbnail is 300px max, no printable quality

**3. Legal**
- Clear copyright notice on every page: "© Many's Photography — All rights reserved"
- Terms of Service page with explicit license grant per client
- Download receipts logged with IP + timestamp
- DMCA-ready — all images include metadata with copyright claim

**4. Delivery Control**
- Print-quality only available after payment confirmation
- Web-quality always watermarked
- Expiring download links (48h after first access)
- Download count limit (configurable: 3x per session)

---

## 🏗️ Architecture

```
Frontend (Next.js 14 App Router)
├── Public site (ISR) — home, portfolio, about, contact
├── Client Portal (/portal/[token]) — private gallery + download
└── Admin (/admin) — Many's dashboard

Backend (Node.js / Hono or Next.js API Routes)
├── Auth: Token generation & validation
├── Storage: S3-compatible (MinIO self-hosted or Cloudflare R2)
├── DB: PostgreSQL (clients, galleries, tokens, download logs)
├── Watermark: Sharp + Canvas pipeline
└── Email: Resend or Postmark (transactional)

Infrastructure
├── Server: Ubuntu 24.04, 4c/8GB minimum
├── Storage: TrueNAS for bulk, local SSD for DB
├── CDN: Cloudflare (free tier) for public assets
├── DNS: Cloudflare Tunnel (no open ports!)
├── SSL: Auto via Cloudflare
└── Backup: rdiff-backup to external HDD + offsite
```

---

## 📦 Client Portal Flow

```
[Many uploads photos]
       ↓
[System creates gallery + generates Token]
       ↓
[Client receives email: "Your photos are ready!"]
       ↓
[Client visits portal.anyphotography.com]
       ↓
[Enters Token: "John Doe-2024-06-15"]
       ↓
[Sees gallery with watermarked previews]
       ↓
[Selects photos → Downloads Web quality]
       ↓
[Optionally: requests Print quality]
       ↓
[Many receives request → approves after payment]
       ↓
[Client downloads Print quality]
       ↓
[Download logged with IP + timestamp]
```

---

## 🚀 Go-to-market Tech Choices

| Need | Choice | Why |
|------|--------|-----|
| Framework | Next.js 14 | SSR, Image optimization, API routes |
| 3D / Animation | Three.js + GSAP | Best-in-class, production proven |
| Database | PostgreSQL | Relational, robust, self-hostable |
| Storage | MinIO (self-hosted S3) | Photographer controls everything |
| Email | Resend | Dev-friendly, cheap, great deliverability |
| Payments | Stripe | Client pays for print quality |
| Hosting | Home server + Cloudflare Tunnel | No port forwarding, free HTTPS |
| CDN | Cloudflare (free) | Global edge, image resizing |
| Monitoring | Grafana + Prometheus | Self-hosted, full control |

---

## 🗓️ Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Domain + hosting setup
- [ ] Next.js boilerplate + deployment
- [ ] Design system (colors, typography, components)
- [ ] Public site pages (Home, Portfolio, About, Contact)
- [ ] Database schema

### Phase 2: The Spinning Wheel (Week 3)
- [ ] Three.js wheel component
- [ ] GSAP spin physics
- [ ] Category landing pages
- [ ] Mobile fallback

### Phase 3: Client Portal (Week 4-5)
- [ ] Token generation + storage
- [ ] Portal page with gallery
- [ ] Download pipeline (watermark → serve)
- [ ] Email delivery

### Phase 4: Admin Dashboard (Week 6)
- [ ] Client management
- [ ] Upload + gallery creation
- [ ] Download monitoring
- [ ] Analytics

### Phase 5: Polish + Launch (Week 7-8)
- [ ] Performance optimization
- [ ] SEO + OG images
- [ ] Award submission prep (Awwwards, CSS Design Awards)
- [ ] Security audit

---

*Document created: 2026-04-14*
*Project: Many's Photography*
