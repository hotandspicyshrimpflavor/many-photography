# Home Server Setup Guide — Many's Photography

> Complete step-by-step guide to set up your home server for Many's Photography website.

**Time:** 3-4 hours  
**Cost:** ~$200-500 for hardware (if starting from scratch)  
**Skill Level:** Intermediate (you've used terminal before)

---

## 📋 Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4 cores | 8+ cores (Intel i5/i7, AMD Ryzen 5/7) |
| RAM | 8 GB | 16-32 GB |
| System SSD | 256 GB NVMe | 512 GB NVMe |
| Photo Storage | 4 TB HDD | 8-16 TB HDD (separate from system) |
| UPS | Basic surge protector | APC 1500VA Battery Backup |
| Network | 100 Mbps | 1 Gbps + static IP |

### Recommended Second-Hand Picks
- **Dell Optiplex 7080 Micro** (~$150-200) — compact, reliable, upgradable
- **HP Elitedesk 800 G6 Mini** (~$150-200) — similar to Dell
- **NUC 10/11/12** (~$200-300) — small, quiet, modern

---

## 1. Install Ubuntu Server 24.04 LTS

### Download Ubuntu
```bash
# Download Ubuntu Server 24.04 LTS
wget https://releases.ubuntu.com/24.04/ubuntu-24.04-live-server-amd64.iso
```

### Create Bootable USB
```bash
# On Mac/Linux - replace /dev/sdX with your USB drive
sudo dd if=ubuntu-24.04-live-server-amd64.iso of=/dev/sdX bs=1M status=progress
```

### Installation Steps
1. Boot from USB — press F12/Delete/Esc to select boot device
2. Select **Ubuntu Server** (not Desktop)
3. Follow the installer:
   - Language: English
   - Network: Connect via Ethernet (WiFi optional)
   - Storage: Use entire disk
   - Profile: Create your admin account (e.g., `many`)
   - **DO NOT** install OpenSSH server yet (we'll do it manually)
4. Wait for installation to complete → reboot

---

## 2. Initial Server Setup

### SSH Into Your Server
```bash
# From your Mac/PC, SSH into the server
ssh many@your-server-ip

# If you don't know the IP, check it on the server:
ip addr show
```

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Essential Tools
```bash
sudo apt install -y curl wget git vim htop net-tools ufw fail2ban
```

### Set Up Static IP (Optional but Recommended)
```bash
sudo vim /etc/netplan/00-installer-config.yaml
```

Add/edit:
```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      addresses:
        - 192.168.1.100/24
      gateway4: 192.168.1.1
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4
```

Apply:
```bash
sudo netplan apply
```

---

## 3. Install Docker & Docker Compose

### Install Docker
```bash
# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add user to docker group (so you don't need sudo)
sudo usermod -aG docker $USER
```

**Logout and back in for group changes to take effect, or run:**
```bash
newgrp docker
```

### Verify Docker
```bash
docker --version
docker compose version
```

Expected output:
```
Docker version 26.0.0, build 2ae76e8
Docker Compose version v2.27.0
```

---

## 4. Configure Firewall (UFW)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (MUST DO THIS FIRST or you'll lock yourself out!)
# Replace YOUR_IP with your home network IP (e.g., 192.168.1.0/24)
sudo ufw allow from YOUR_IP to any port 22

# Allow HTTP and HTTPS (for web traffic)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status verbose
```

Expected output:
```
Status: active

To                         Action      From
--                         ------      ----
22                         ALLOW       YOUR_IP
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

---

## 5. Set Up Cloudflare Tunnel (No Open Ports!)

This is critical — Cloudflare Tunnel lets you expose your server to the internet **without opening any ports** on your firewall.

### Create Cloudflare Account
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Sign up / Log in
3. Go to **Zero Trust** → **Networks** → **Tunnels**
4. Click **Create a tunnel**
5. Select **Cloudflared** as the connector
6. Name it: `many-photography`
7. Click **Save tunnel**

You'll get a **tunnel token** — copy it, you'll need it in a moment.

### Install Cloudflared on Your Server
```bash
# Download cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Verify
cloudflared --version
```

### Authenticate Cloudflared
```bash
cloudflared tunnel login
```
This will open a browser window for Cloudflare authorization.

### Create the Tunnel
```bash
# Replace the token with yours from the Cloudflare dashboard
cloudflared service install YOUR_TUNNEL_TOKEN_HERE
```

### Verify Tunnel Status
```bash
sudo systemctl status cloudflared
```

---

## 6. Clone & Deploy the Project

### Clone the Repository
```bash
# SSH key setup (first time only)
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "many@server"

# Copy your public key to GitHub
cat ~/.ssh/id_ed25519.pub
# Add this to GitHub → Settings → SSH Keys

# Clone the repo
git clone git@github.com:Hotandspicyshrimpflavor/many-photography.git
cd many-photography
```

### Set Up Environment
```bash
# Copy the example env file
cp .env.example .env

# Edit with your values
vim .env
```

Fill in:
```env
# Database (use defaults for docker-compose)
DATABASE_URL="postgresql://many:password@postgres:5432/many_photography?schema=public"

# MinIO - generate strong random keys
MINIO_ACCESS_KEY="generate-a-random-access-key"
MINIO_SECRET_KEY="generate-a-strong-random-secret"

# Resend (get from resend.com)
RESEND_API_KEY="re_your_resend_key"

# Cloudflare Tunnel
CF_TUNNEL_TOKEN="your-tunnel-token"

# Admin account
ADMIN_EMAIL="many@yourdomain.com"
ADMIN_PASSWORD="a-very-secure-password"

# App URL (update when you have domain)
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_CLOUDFLARE_TUNNEL_URL="https://yourdomain.com"
```

### Deploy with Docker Compose
```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

Expected output:
```
NAME                IMAGE                    STATUS
many-photography-web-1   many-photography-web   Up 2 minutes
postgres-1              postgres:16-alpine      Up 3 minutes
minio-1                  minio/minio             Up 2 minutes
cloudflare-tunnel-1      cloudflare/cloudflared  Up 2 minutes
```

---

## 7. Initialize Database

```bash
# Generate Prisma client
docker compose exec web npx prisma generate

# Push schema to database
docker compose exec web npx prisma db push

# Open Prisma Studio (optional - database GUI)
docker compose exec web npx prisma studio
```

---

## 8. Set Up Automated Backups

### Backup Script
```bash
sudo vim /usr/local/bin/backup-many.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d-%H%M)
BACKUP_DIR=/mnt/backup-hdd/many-photography
SOURCE_DIR=/opt/many-photography

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker compose exec -T postgres pg_dump -U many many_photography > $BACKUP_DIR/db-$DATE.sql

# Backup MinIO data
rsync -a $SOURCE_DIR/minio-data/ $BACKUP_DIR/minio-$DATE/

# Keep last 7 daily backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -type d -name "minio-*" -mtime +7 -exec rm -rf {} +

echo "Backup completed: $DATE"
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/backup-many.sh
```

### Schedule Daily Backup (2 AM)
```bash
sudo crontab -e
```

Add:
```
0 2 * * * /usr/local/bin/backup-many.sh >> /var/log/backup.log 2>&1
```

---

## 9. Set Up Systemd Service (Auto-Start on Reboot)

```bash
sudo vim /etc/systemd/system/many-photography.service
```

Add:
```ini
[Unit]
Description=Many's Photography Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/many-photography
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
User=many

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl daemon-reload
sudo systemctl enable many-photography.service
```

---

## 10. Domain Setup (Cloudflare)

Once you have your domain:

### DNS Configuration
1. Go to **dash.cloudflare.com**
2. Select your domain
3. Go to **DNS** → **Records**
4. Add:
   - **Type:** CNAME
   - **Name:** @ (or 'www')
   - **Target:** `your-tunnel-id.cfargotunnel.com`
   - **Proxy status:** Proxied (orange cloud)

### Force HTTPS
1. Go to **SSL/TLS** → **Overview**
2. Set to **Full** or **Full (strict)**

---

## 🆘 Troubleshooting

### Can't SSH After Firewall Setup
```bash
# If you get locked out, access server directly (keyboard/monitor)
# Then check UFW status
sudo ufw status

# If you blocked yourself, allow your IP
sudo ufw allow from YOUR_IP to any port 22
```

### Docker Container Won't Start
```bash
# Check logs
docker compose logs [service-name]

# Common issues:
# - Port already in use: change port in docker-compose.yml
# - Environment variable missing: check .env file
```

### Cloudflare Tunnel Not Connecting
```bash
# Check cloudflared status
sudo systemctl status cloudflared

# View logs
journalctl -u cloudflared -f

# Re-authenticate
cloudflared tunnel login
```

### Database Connection Error
```bash
# Verify postgres is running
docker compose ps postgres

# Test connection
docker compose exec postgres psql -U many -d many_photography

# Check logs
docker compose logs postgres
```

---

## 📞 Quick Commands Reference

```bash
# Restart everything
cd /opt/many-photography && docker compose restart

# View all logs
docker compose logs -f

# Update to latest code
git pull && docker compose up -d --build

# Create admin user
docker compose exec web node scripts/create-admin.js

# View disk usage
df -h

# View Docker disk usage
docker system df

# Clean up old Docker objects
docker system prune -a
```

---

## 🔒 Security Checklist

- [ ] UFW firewall enabled with SSH from YOUR_IP only
- [ ] Strong passwords for all services
- [ ] Cloudflare Tunnel connected (no open ports!)
- [ ] Fail2ban installed and configured
- [ ] Automated backups running
- [ ] SSL/TLS enabled via Cloudflare
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade -y`

---

*Last updated: 2026-04-14*
