# Many's Photography — Product Requirements Document

**Version:** 1.0  
**Date:** 2026-04-14  
**Author:** xiao (AI Assistant)  
**Status:** Approved for Development

---

## 1. Project Overview

### Project Name
**Many's Photography** — Professional Photography Business Website & Client Portal

### Core Problem
Many, a professional photographer, needs a website that simultaneously serves as an award-winning interactive portfolio (to attract clients) and a secure private delivery system (to deliver finished work while protecting copyright).

### Core Solution
A self-hosted photography website featuring:
1. An immersive, award-worthy homepage with a **3D spinning wheel** that showcases work categories
2. A **token-based client portal** where clients access their private gallery using a unique code derived from their legal name + first shoot date
3. A **watermark-protected download system** with Web (compressed, watermarked) and Print (original, watermarked) quality tiers
4. Full **copyright protection** via technical, visual, and legal layers

### Target Users
| User | Goals |
|------|-------|
| **Visitors** | Experience the portfolio, explore work, contact Many |
| **Potential Clients** | Learn about services, view pricing, book a session |
| **Existing Clients** | Access private gallery, download their photos/videos |
| **Many (Admin)** | Manage clients, upload work, monitor downloads |

### Hardware Context
The entire stack runs on a **home server** (self-hosted) — no cloud hosting fees beyond domain name and optional third-party services.

---

## 2. User Stories

---

```
US-01：作为访客，我想体验沉浸式互动作品集
- 角色：作为 任意访客
- 场景：当 打开网站首页
- 意图：希望 被震撼的视觉体验吸引并探索作品
- 动机：以便 留下深刻印象并考虑预约拍摄

US-02：作为潜在客户，我想了解 Many 的风格、服务和定价
- 角色：作为 潜在付费客户
- 场景：当 在考虑预约 Many 的摄影服务
- 意图：希望 看到作品风格、了解服务内容、查看价格
- 动机：以便 决定是否预约并选择合适的服务套餐

US-03：作为客户，我想凭唯一凭证登录私密画廊查看和下载我的作品
- 角色：作为 已完成拍摄的 Many 客户
- 场景：当 收到 Many 的作品交付通知（含 Token）
- 意图：希望 登录我的私密画廊、预览照片/视频、下载我想要的
- 动机：以便 收到并保存我的照片/视频作品

US-04：作为 Many，我想安全地交付作品并保护我的版权
- 角色：作为 Many（摄影师兼管理员）
- 场景：当 完成拍摄并准备向客户交付作品
- 意图：希望 上传作品、生成客户 Token、控制下载质量
- 动机：以便 客户满意收到作品，同时作品不被盗用或未授权传播

US-05：作为 Many，我想通过网站建立品牌权威并获得新客户
- 角色：作为 Many
- 场景：当 希望提升品牌影响力和专业度
- 意图：希望 展示获奖经历、发布作品故事、显示客户评价
- 动机：以便 吸引更多高端客户、提升预约转化率
```

---

## 3. Functional Specification

---

### 3.1 Homepage — Spinning Wheel Hero

#### Concept
Full-viewport hero section replaces traditional image carousel with an interactive **3D spinning wheel** divided into work categories. User clicks/taps or scrolls to spin. Wheel decelerates with physics-based easing (spring + friction) and lands on a category. The selected category expands with a cinematic reveal into the gallery preview.

#### Visual Behavior
- Wheel: 3D disc rendered with Three.js, floating with subtle ambient motion
- Categories displayed as angular segments with thumbnail images
- Spin triggered by: scroll past hero, button tap, or auto-spin on first load (3s delay)
- Deceleration: 3-5 second spring physics, cubic-bezier ease-out
- Landing: category "clicks" into focus, radial wipe transition reveals gallery
- Ambient: subtle particle field behind wheel (bokeh light dots)

#### Fallback (low-power devices / no WebGL)
- CSS 3D transforms wheel (reduced particles)
- Final fallback: animated static grid with category tabs

#### Categories (configurable by Many)
| Segment | Label | Thumbnail |
|---------|-------|-----------|
| 1 | Wedding | [wedding hero image] |
| 2 | Portrait | [portrait hero image] |
| 3 | Commercial | [commercial hero image] |
| 4 | Video | [video thumbnail + play icon] |
| 5 | Events | [events hero image] |
| 6 | Awards | [award badge + year] |

#### Page Structure

```
┌─────────────────────────────────────────────────────────┐
│  NAV: Logo (left) | Menu (center) | Contact (right)   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              🎡 3D SPINNING WHEEL HERO                  │
│                                                         │
│   [About the wheel]                                     │
│   "Spin to explore our work"                           │
│                                                         │
│   [↓ Scroll / Tap to spin]                             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  FEATURED WORK (3-5 images grid, from selected cat)   │
├─────────────────────────────────────────────────────────┤
│  ABOUT MANY: Photo + bio text                          │
├─────────────────────────────────────────────────────────┤
│  TESTIMONIALS: 2-3 client quotes carousel             │
├─────────────────────────────────────────────────────────┤
│  AWARDS: CSSDA / Awwwards badges + logo                │
├─────────────────────────────────────────────────────────┤
│  FOOTER: Social links | © | Privacy | Terms           │
└─────────────────────────────────────────────────────────┘
```

---

### 3.2 Portfolio Pages

Each category has its own subpage (`/portfolio/wedding`, `/portfolio/portrait`, etc.)

#### Gallery Page Behavior
- Masonry grid of images with consistent gutter
- Lightbox on click: full-screen with zoom (scroll wheel), arrow navigation
- Filter bar: date range, tags, featured only
- Lazy loading: images load as they enter viewport (blur-up placeholder)

#### Video Showcase
- Thumbnail with play button overlay
- Click: inline player (not full YouTube embed for rights protection)
- No download button visible on preview

---

### 3.3 Services & Pricing Page

```
┌─────────────────────────────────────────────────────────┐
│  SERVICES OVERVIEW                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ Wedding  │ │ Portrait │ │Commercial│              │
│  │ from $X  │ │ from $X  │ │  from $X │              │
│  └──────────┘ └──────────┘ └──────────┘              │
├─────────────────────────────────────────────────────────┤
│  PACKAGE DETAILS (expandable per service)              │
│  - What's included                                     │
│  - Delivery timeline                                   │
│  - # of edited photos                                  │
│  - Print quality available: Yes/No                     │
├─────────────────────────────────────────────────────────┤
│  BOOKING CTA: [Book Now] → contact form               │
└─────────────────────────────────────────────────────────┘
```

---

### 3.4 Contact / Booking Page

- Form fields: Name, Email, Phone (optional), Service type (dropdown), Preferred date, Message
- On submit: email to Many (via Resend), auto-confirmation to client
- Honeypot field for spam prevention

---

### 3.5 Client Portal (`/portal/[token]`)

#### Token Generation Rules

Token is generated by Many in the admin panel when uploading finished work for a client.

**Token = `CLIENT_FULL_NAME-FIRST_SHOOT_DATE`**

Examples:
```
JOHN DOE-2024-06-15
MARIA GARCIA LOPEZ-2024-08-22
```

- Stored as bcrypt hash in database
- Displayed to Many as plain text (to share with client)
- Case-insensitive matching on login

#### Login Flow

```
[Client visits /portal]
         ↓
[Enters Token: "JOHN DOE-2024-06-15"]
         ↓
[System validates: hashes input, compares to stored hash]
         ↓
[Match → Access granted to client's private gallery]
[No match → Error: "Invalid token. Please check your code."]
         ↓
[After 5 failed attempts → Token locked for 15 minutes]
```

#### Portal UI

```
┌─────────────────────────────────────────────────────────┐
│  MANY'S PHOTOGRAPHY          [Token: JOHN DOE-2024...] │
│                              [Logout]                   │
├─────────────────────────────────────────────────────────┤
│  Hi John! Your session from June 15, 2024 is ready.     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │         PRIVATE GALLERY (masonry grid)          │   │
│  │   [img] [img] [img] [img]                       │   │
│  │   [img] [img] [img] [img]                       │   │
│  │   [img] [img] [img] [img]                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [ ] Select All    [Download Web Quality (N photos)]    │
│                                                         │
│  ⚠ Web downloads are watermarked.                      │
│  📧 Request Print Quality → email to Many              │
├─────────────────────────────────────────────────────────┤
│  Download expires in: 30 days                          │
└─────────────────────────────────────────────────────────┘
```

#### Gallery Behavior
- Only shows photos/videos for this specific session
- No right-click, no drag, no image context menu
- Images load with watermark overlay baked in via CSS
- Hover: subtle zoom + "View" badge

#### Download System

| Quality | Watermark | Resolution | Use Case | Access |
|---------|-----------|------------|----------|--------|
| **Web** | Visible logo, bottom-right | max 2048px long edge | Social sharing | Self-serve after login |
| **Print** | Visible logo, bottom-right | Original full resolution | Printing | Request → Many approves after payment |

**Web Download Flow:**
1. Client selects photos (checkboxes) or "Select All"
2. Clicks "Download Web Quality"
3. System generates ZIP of watermarked JPEGs
4. Signed expiring URL generated (48h validity)
5. Download starts automatically
6. Download event logged: token, IP, timestamp, file list

**Print Quality Request:**
1. Client clicks "Request Print Quality"
2. Form: Name, Email, Intended use (dropdown: personal print, commercial, editorial)
3. Sends email to Many via Resend
4. Many reviews → sends payment link (Stripe) → on payment confirmation, generates Print-quality download link

---

### 3.6 Admin Dashboard (`/admin`)

Protected by Many's own login (email + strong password + 2FA)

#### Dashboard Sections

**Clients**
- List all clients with search/filter
- Add new client: Full Name, Email, Phone, Notes
- View client history: sessions, tokens, downloads

**Galleries**
- Create gallery: select client, set session date, title, description
- Upload photos/videos (drag-and-drop, progress bar)
- Generate Token for client
- Mark Print Quality: Included / Not Included (per gallery)

**Downloads Log**
| Column | Description |
|--------|-------------|
| Client | Who downloaded |
| Token | Token used |
| Files | What was downloaded |
| Quality | Web / Print |
| IP Address | Downloader's IP |
| Timestamp | When |
| Expires | Link expiry time |

**Settings**
- Service packages + pricing
- Email templates (delivery notification, reminder)
- Business info (for invoices/contracts)
- Gallery expiration default (30/60/90 days)

---

### 3.7 Copyright Protection System

#### Technical Protection

| Protection | Implementation |
|------------|----------------|
| No direct image URLs | All images served via signed, expiring URLs from MinIO |
| Canvas proxy | Images rendered in canvas, exported as data URL (no right-click save) |
| CORS lock | Images only load on domain's pages |
| DevTools detection | Basic anti-debug (alert on F12 / DevTools open) |
| Draggable off | `draggable="false"` on all images |
| User select none | `user-select: none` on gallery images |

#### Visual Watermark Pipeline

```
Original File Upload (Many)
        ↓
Sharp (Node.js) processes:
  1. Resize to max dimension
  2. Burn watermark: "© Many's Photography" + logo, bottom-right corner
  3. Save to MinIO storage
        ↓
Thumbnail (300px, heavily watermarked) → for gallery preview
Web Quality (2048px, watermarked) → for client download
Print Quality (original, watermarked) → for paid download
Original (no watermark) → stored separately, never exposed
```

#### Steganographic Watermark (Advanced)
- Invisible watermark embedded using `OpenCV` or `stegify`
- Survives: resize, compression, cropping
- Used for forensic tracking if images appear unauthorized online

#### Legal Protection

| Element | Location |
|---------|----------|
| Copyright notice | Every page footer, image metadata EXIF |
| Terms of Service | `/terms` — explicit license grant per client |
| Privacy Policy | `/privacy` — data handling |
| Download ToS agreement | Must accept before first download |
| DMCA agent | Registered with US Copyright Office |

---

### 3.8 Email System

#### Transactional Emails

| Email | Trigger | To |
|-------|---------|-----|
| **Token Delivery** | Many generates token | Client |
| **Download Reminder** | 7 days before expiration | Client |
| **Print Quality Request** | Client submits request | Many |
| **Print Quality Ready** | Many approves | Client |
| **Download Expired** | After expiration | Client |
| **Booking Inquiry** | Contact form submit | Many |
| **Auto-reply** | Booking inquiry received | Client |

#### Resend Configuration
```javascript
// Resend SDK
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates use React Email components
// Templates stored in /emails directory
```

#### Email Alternatives Evaluated

| Provider | Price | Pros | Cons | Verdict |
|----------|-------|------|------|---------|
| **Resend** | $20/mo — 50K emails | Best dev experience, React Email, great deliverability | None significant | ✅ **Recommended** |
| **Postmark** | $45/mo — 25K emails | Transactional specialist, 99.99% uptime SLA | More expensive | Good alternative |
| **SendGrid** | $15/mo — 100K emails | High volume, full featured | Complex API, rate limits | OK for volume |
| **AWS SES** | ~$0.10/1K emails | Essentially free at low volume, AWS integration | Complex setup, no templates built-in | Good if already on AWS |
| **Brevo (Sendinblue)** | Free — 300/day | Generous free tier, all-in-one | Deliverability less consistent | Good for bootstrapping |
| **Loops** | $25/mo — unlimited | Unlimited emails, Postmark alternative | Newer, less proven | Worth watching |
| **Mailgun** | $35/mo — 50K emails | Great API, good deliverability | Expensive for what you get | Overkill for this use case |

**Recommendation:** Start with **Brevo's free tier** (300/day, enough for a new business) → upgrade to **Resend** ($20/mo) when volume picks up. Resend's React Email builder is worth the cost for a photography business that sends beautiful, on-brand emails.

---

## 4. Page Architecture

| Route | Description | Auth |
|-------|-------------|------|
| `/` | Homepage with spinning wheel hero | Public |
| `/portfolio` | Portfolio categories | Public |
| `/portfolio/[category]` | Category gallery | Public |
| `/services` | Services & pricing | Public |
| `/about` | About Many | Public |
| `/contact` | Booking inquiry form | Public |
| `/awards` | Awards & recognition | Public |
| `/terms` | Legal: terms of service | Public |
| `/privacy` | Legal: privacy policy | Public |
| `/portal` | Client portal login | Token |
| `/portal/[token]` | Client private gallery | Token (hash validated) |
| `/admin` | Admin dashboard | Many's login + 2FA |
| `/admin/clients` | Client management | Admin |
| `/admin/galleries` | Gallery management | Admin |
| `/admin/downloads` | Download audit log | Admin |

---

## 5. Database Schema (PostgreSQL)

```sql
-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Galleries
CREATE TABLE galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  title VARCHAR(255) NOT NULL,
  session_date DATE NOT NULL,
  description TEXT,
  print_quality_included BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tokens (bcrypt hashed)
CREATE TABLE tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID REFERENCES galleries(id),
  token_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  attempts INT DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Downloads Log
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID REFERENCES galleries(id),
  token_id UUID REFERENCES tokens(id),
  quality VARCHAR(20) CHECK (quality IN ('web', 'print')),
  file_count INT,
  ip_address INET,
  downloaded_at TIMESTAMP DEFAULT NOW()
);

-- Files (metadata)
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID REFERENCES galleries(id),
  original_filename VARCHAR(255),
  storage_path VARCHAR(500),
  file_type VARCHAR(50), -- 'image' | 'video'
  mime_type VARCHAR(100),
  file_size BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Print Quality Requests
CREATE TABLE print_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID REFERENCES galleries(id),
  client_email VARCHAR(255),
  intended_use VARCHAR(100),
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')),
  stripe_payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. Infrastructure — Home Server

### Hardware Targets
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4 cores | 8+ cores |
| RAM | 8 GB | 16-32 GB |
| System SSD | 256 GB | 512 GB NVMe |
| Photo/Video Storage | 4 TB | 8-16 TB HDD (separate) |
| UPS | Basic | APC 1500VA |

### OS & Base Setup
```bash
# OS: Ubuntu Server 24.04 LTS
sudo apt update && sudo apt upgrade -y

# Docker + Docker Compose (for easy service management)
curl -fsSL https://get.docker.com | sh
sudo apt install docker-compose

# Fail2ban (brute force protection)
sudo apt install fail2ban

# UFW Firewall
sudo ufw default deny incoming
sudo ufw allow 22/tcp from YOUR_IP only
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Docker Services
```yaml
# docker-compose.yml (core services)
services:
  nextjs:
    image: many-photography-web
    restart: always
    ports:
      - "3000:3000"
    env_file: .env

  minio:
    image: minio/minio
    restart: always
    command: server /data --console-address ":9001"
    volumes:
      - ./minio-data:/data
    environment:
      MINIO_ROOT_USER: ${MINIO_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}

  postgres:
    image: postgres:16
    restart: always
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: many_photography
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  cloudflare-tunnel:
    image: cloudflare/cloudflared
    restart: always
    command: tunnel --no-autoupdate run --token ${CF_TUNNEL_TOKEN}
```

### Cloudflare Tunnel (No Open Ports!)
```bash
# Install cloudflared on server
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

# Authenticate (get token from Cloudflare Zero Trust dashboard)
cloudflared service install <TUNNEL_TOKEN>

# DNS: point manyphotography.com CNAME to <tunnel-id>.cfgtunnel.com
```

### Backup Strategy
```bash
# Nightly backup to external HDD (rsync)
0 3 * * * rsync -a /opt/many-photography/data/ /mnt/backup-hdd/many-photography/ --delete

# Weekly offsite (restic to S3-compatible storage or another location)
0 4 * * 0 restic backup /opt/many-photography/data/ --repo s3:https://backup.example.com/many
```

---

## 7. Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Ubuntu server setup + Docker
- [ ] Domain + Cloudflare Tunnel
- [ ] Next.js 14 app scaffold + CI/CD
- [ ] Design system: colors, typography, components
- [ ] PostgreSQL + MinIO setup
- [ ] Database schema + migrations
- [ ] Public pages: Home, About, Services, Contact, Awards

### Phase 2: The Spinning Wheel (Week 3)
- [ ] Three.js wheel component
- [ ] GSAP spin animation + physics
- [ ] Category landing pages
- [ ] Mobile fallback + responsive polish
- [ ] Performance optimization (Core Web Vitals)

### Phase 3: Client Portal (Week 4-5)
- [ ] Token generation (admin)
- [ ] Portal login + validation
- [ ] Private gallery view
- [ ] Watermark pipeline (Sharp)
- [ ] Web quality download (ZIP)
- [ ] Resend email integration
- [ ] Token delivery email

### Phase 4: Admin + Rights (Week 6)
- [ ] Admin auth (login + 2FA)
- [ ] Client CRUD
- [ ] Gallery management + upload
- [ ] Print quality request flow
- [ ] Steganographic watermark (advanced)
- [ ] Download audit logging
- [ ] Copyright notices + metadata

### Phase 5: Polish + Launch (Week 7-8)
- [ ] SEO + Open Graph images
- [ ] Awwwards / CSS Design Awards submission
- [ ] Security audit (OWASP checklist)
- [ ] Penetration testing (basic)
- [ ] Documentation (admin manual)
- [ ] Launch 🚀

---

## 8. Open Questions

| # | Question | Recommendation |
|---|----------|----------------|
| 1 | Print quality — how does payment work? | Stripe payment links generated manually by Many for now; full Stripe integration in Phase 4 |
| 2 | SMS notifications (optional) | Use Twilio ($1/mo for a number, pay-per-SMS). Skip for Phase 1, add in Phase 4 if volume warrants |
| 3 | Video delivery | Self-hosted via MinIO; embed player with disabled download. YouTube/Vimeo not allowed (protects rights) |
| 4 | Gallery expiration default | 30 days from first access recommended; configurable per client |
| 5 | Number of photos per job | Unlimited uploads; no per-gigabyte pricing since self-hosted |
| 6 | SSL certificate | Handled automatically by Cloudflare (full SSL mode) |

---

## Appendix: Award Submission Checklist

For **Awwwards** and **CSS Design Awards** submission:

- [ ] Case study video (60-90 sec)
- [ ] Process documentation (how it was built)
- [ ] All URLs submitted (homepage, portal, admin — admin can be demo)
- [ ] Judge notes: "First interactive photography portfolio using physics-based 3D wheel"
- [ ] Mobile-responsive screenshots
- [ ] Performance audit (Lighthouse 90+)

---

*Document approved for development*
*xiao — 2026-04-14*
