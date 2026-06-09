# Minifra Sentinel — Vendor Portal

Standalone Docker-ready React frontend for the **Minifra Sentinel Control Platform — Vendor Operations Portal**.

---

## What's Inside

| Section | Pages |
|---------|-------|
| Dashboard | Real-time KPI overview (customers, licenses, cases, releases) |
| Customers | Customer registry — create, view detail, risk status |
| Sites | Site registry — create sites, deployment checklist |
| Deployments | Deployment stage tracker with per-stage checklists |
| Licenses | License factory — generate, renew, revoke with full audit |
| Hardware Bindings | Approve/reject node-locked hardware binding requests |
| License Migrations | Full migration workflow (dual-validity, cutover, deactivation) |
| Package Builder | Generate signed deployment packages for customers |
| Builds / Releases | Release tracker with multi-gate approval workflow |
| Support Bundles | Diagnostic bundle analyzer — detects 14 issue categories |
| Support Cases | L1/L2/L3 support case management with escalation |
| Security Reviews | Security audit tracker with 14-point compliance checklist |
| Partner Engineers | Restricted-access partner management with audit trail |
| Vendor Audit Logs | Full searchable log of all vendor operations |
| Knowledge Base | Article authoring + search by category and tag |

**Role-based UI** — switch between 8 vendor roles in the top bar:  
`Owner` · `Release Manager` · `License Manager` · `L1 Support` · `L2 Support` · `L3 Support` · `Security Reviewer` · `Partner Engineer`

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) 20+  
- [Docker Compose](https://docs.docker.com/compose/install/) v2 (or `docker compose`)
- Your company's backend must expose `/api/sentinel/vendor/*` endpoints  
  (see [API Contract](#api-contract) below)

---

## Quick Start

### 1. Clone and configure

```bash
git clone <this-repo-url>
cd sentinel-vendor
cp .env.example .env
```

Edit `.env`:

```dotenv
# URL of your company's API server (no trailing slash)
API_BASE_URL=https://api.yourcompany.com
```

### 2. Build and run with Docker Compose

```bash
docker compose up --build -d
```

Portal is now live at **http://localhost:8080**.

All `/api/*` requests from the browser are proxied by nginx to your `API_BASE_URL`.

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `API_BASE_URL` | `http://api:3001` | Backend API base URL. nginx proxies all `/api/*` requests here. |

Set this in your `.env` file or pass it directly to Docker:

```bash
docker run -p 8080:80 \
  -e API_BASE_URL=https://api.yourcompany.com \
  sentinel-vendor-portal:latest
```

> **Note:** `API_BASE_URL` is used at **runtime** by nginx (not baked in at build time). You can change it and restart the container without rebuilding.

### Custom API Upstream (nginx)

If you need to change the API target without environment variables, edit `nginx/default.conf`:

```nginx
location /api/ {
    proxy_pass http://your-backend-host:port;
    ...
}
```

Then rebuild: `docker compose up --build -d`

---

## Local Development (without Docker)

```bash
npm install
cp .env.example .env
# Edit .env — set VITE_API_BASE_URL to your backend
npm run dev
```

The Vite dev server proxies `/api/*` to `VITE_API_BASE_URL` automatically.

---

## Building for Production

```bash
# Plain build output in ./dist
npm run build

# Or build the Docker image directly
docker build \
  --build-arg VITE_API_BASE_URL=https://api.yourcompany.com \
  -t sentinel-vendor-portal:1.0.0 .
```

---

## API Contract

The portal calls these endpoints on your backend. All paths are relative to `/api/sentinel/vendor`.

### Authentication

Add any auth headers your backend requires (JWT, API key, etc.) in `src/lib/api.ts`:

```typescript
const res = await fetch(`${BASE}${path}`, {
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`,  // ← add here
  },
  ...opts,
});
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/vendor/dashboard` | KPI summary |
| `GET` | `/vendor/customers` | List all customers |
| `GET` | `/vendor/customers/:id` | Customer detail (contacts, sites, licenses, packages) |
| `POST` | `/vendor/customers` | Create customer |
| `GET` | `/vendor/sites` | List all sites |
| `POST` | `/vendor/sites` | Create site |
| `GET` | `/vendor/deployments` | List deployments |
| `POST` | `/vendor/deployments/:id/update-stage` | Update deployment stage |
| `GET` | `/vendor/licenses` | List licenses |
| `POST` | `/vendor/licenses` | Create license |
| `POST` | `/vendor/licenses/:id/renew` | Renew license |
| `POST` | `/vendor/licenses/:id/revoke` | Revoke license |
| `GET` | `/vendor/hardware-bindings` | List binding requests |
| `POST` | `/vendor/hardware-bindings/:id/approve` | Approve binding |
| `POST` | `/vendor/hardware-bindings/:id/reject` | Reject binding |
| `GET` | `/vendor/license-migrations` | List migration requests |
| `POST` | `/vendor/license-migrations/:id/approve` | Approve migration |
| `POST` | `/vendor/license-migrations/:id/reject` | Reject migration |
| `GET` | `/vendor/packages` | List generated packages |
| `POST` | `/vendor/packages/generate` | Generate a new package |
| `GET` | `/vendor/releases` | List releases |
| `POST` | `/vendor/releases/:id/approve` | Approve production release (Owner only) |
| `GET` | `/vendor/support-bundles` | List support bundles |
| `POST` | `/vendor/support-bundles/:id/analyze` | Analyze a bundle |
| `GET` | `/vendor/support-cases` | List support cases |
| `POST` | `/vendor/support-cases` | Create support case |
| `GET` | `/vendor/security-reviews` | List security reviews |
| `POST` | `/vendor/security-reviews` | Create security review |
| `GET` | `/vendor/partner-engineers` | List partner engineers |
| `POST` | `/vendor/partner-engineers` | Add partner engineer |
| `GET` | `/vendor/audit` | Vendor audit log |
| `GET` | `/vendor/knowledge-base` | List KB articles |
| `POST` | `/vendor/knowledge-base` | Create KB article |

### Example Response Shapes

<details>
<summary><code>GET /vendor/dashboard</code></summary>

```json
{
  "totalCustomers": 3,
  "activeCustomers": 2,
  "expiringLicenses": 1,
  "pendingActivationRequests": 1,
  "pendingMigrationRequests": 0,
  "openSupportCases": 2,
  "latestProductVersion": "3.0.1",
  "packagesGenerated": 4,
  "securityReviewsPending": 0,
  "productionReleasesPendingApproval": 1,
  "recentActivity": [
    { "time": "09:00", "event": "License LIC-ALPHA-001 generated" }
  ]
}
```
</details>

<details>
<summary><code>GET /vendor/customers</code></summary>

```json
[
  {
    "id": "CUST-ALPHA",
    "name": "Alpha Manufacturing",
    "shortCode": "ALPHA",
    "contractId": "CTR-2026-001",
    "productEdition": "Enterprise",
    "supportTier": "Platinum",
    "licenseType": "Perpetual+Subscription",
    "licenseExpiry": "2026-12-31",
    "sites": 1,
    "allowedAgents": 10,
    "currentVersion": "3.0.1",
    "deploymentStatus": "PRODUCTION",
    "riskStatus": "LOW"
  }
]
```
</details>

<details>
<summary><code>GET /vendor/releases</code> — gates shape</summary>

```json
[
  {
    "id": "REL-001",
    "version": "3.0.1",
    "buildNumber": "20260601-001",
    "releaseType": "production",
    "approvalStatus": "APPROVED",
    "signatureStatus": "SIGNED",
    "buildDate": "2026-06-01",
    "buildOwner": "devops@minifra.io",
    "gitCommit": "a1b2c3d",
    "gates": {
      "engineering": true,
      "security": true,
      "installer": true,
      "upgrade": true,
      "rollback": true,
      "documentation": true,
      "ownerApproval": true
    },
    "packageChecksum": "sha256:abc123...",
    "releaseNotes": "Bug fixes and performance improvements",
    "securityFixes": "None",
    "knownIssues": "None",
    "upgradeNotes": "In-place upgrade supported from 3.0.0"
  }
]
```
</details>

---

## Production Deployment

### Behind a Reverse Proxy (nginx / Traefik / Caddy)

The container listens on port 80. Map it to whatever external port you need and set `API_BASE_URL` to your internal API host.

Example with Traefik labels:

```yaml
labels:
  - "traefik.http.routers.vendor.rule=Host(`vendor.yourcompany.com`)"
  - "traefik.http.services.vendor.loadbalancer.server.port=80"
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sentinel-vendor
spec:
  replicas: 2
  template:
    spec:
      containers:
        - name: sentinel-vendor
          image: your-registry/sentinel-vendor-portal:1.0.0
          ports:
            - containerPort: 80
          env:
            - name: API_BASE_URL
              valueFrom:
                secretKeyRef:
                  name: sentinel-secrets
                  key: api-base-url
```

---

## Project Structure

```
sentinel-vendor/
├── src/
│   ├── App.tsx                      # Router — all 15 vendor routes
│   ├── main.tsx                     # React entry point
│   ├── index.css                    # Tailwind base styles
│   ├── lib/
│   │   ├── api.ts                   # Fetch wrapper — change auth headers here
│   │   ├── role-context.tsx         # Role state (UI only, not enforced server-side)
│   │   └── utils.ts                 # cn() utility
│   ├── components/
│   │   ├── AppShell.tsx             # Sidebar + topbar layout
│   │   └── StatusBadge.tsx          # Coloured status pill component
│   └── pages/vendor/
│       ├── VendorDashboard.tsx
│       ├── VendorCustomers.tsx
│       ├── VendorSites.tsx
│       ├── VendorDeployments.tsx
│       ├── VendorLicenses.tsx
│       ├── VendorHardwareBindings.tsx
│       ├── VendorLicenseMigrations.tsx
│       ├── PackageBuilder.tsx
│       ├── VendorReleases.tsx
│       ├── VendorSupportBundles.tsx
│       ├── VendorSupportCases.tsx
│       ├── VendorSecurityReviews.tsx
│       ├── VendorPartnerEngineers.tsx
│       ├── VendorAudit.tsx
│       └── VendorKnowledgeBase.tsx
├── nginx/
│   └── default.conf                 # nginx: SPA fallback + /api proxy
├── Dockerfile                       # Multi-stage build → nginx
├── docker-compose.yml               # Compose with API_BASE_URL env var
├── .env.example                     # Copy to .env and set API_BASE_URL
├── vite.config.ts                   # Dev server proxy to backend
├── tsconfig.json
└── package.json
```

---

## Connecting to Your Company Backend

The only file you need to modify for backend integration is **`src/lib/api.ts`**.

Current implementation:

```typescript
const BASE = "/api/sentinel";

async function req(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  ...
}
```

**Add your auth token:**

```typescript
import { getAuthToken } from "./auth";   // your auth helper

async function req(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getAuthToken()}`,
    },
    credentials: "include",   // if using cookies
    ...opts,
  });
  ...
}
```

**Change the base path** if your backend uses a different prefix:

```typescript
const BASE = "/api/v2/sentinel";   // or whatever your backend uses
```

---

## License

Internal use — Minifra Sentinel Platform.
