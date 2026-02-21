# SelfDirectedIRA Frontend

Frontend application for the Self-Directed IRA registration and dashboard experience (Next.js + React + TypeScript).

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

1. Install dependencies:
   - `npm install`
2. Create your local env file (example):
   - Copy `.env.local.example` to `.env.local`
3. Configure API base URL in `.env.local` (if needed), for example:
  - `NEXT_PUBLIC_API_URL=http://localhost:5000`
  - You can also use `http://localhost:5000/api`; both formats are supported.

## Run locally

- Start development server:
  - `npm run dev`
- App runs by default at:
  - `http://localhost:3000`

## Build and run production

- Build:
  - `npm run build`
- Start:
  - `npm run start`

## Other scripts

- Lint:
  - `npm run lint`
- Test:
  - `npm run test`
- Project setup helper:
  - `npm run setup`

## Deployment

### Vercel

1. Import this repository in Vercel.
2. Set required environment variables (for example `NEXT_PUBLIC_API_URL`).
3. Keep default Next.js build settings.
4. Deploy.

### Docker

Build image:

- `docker build -f frontend.Dockerfile -t selfdirectedira-frontend .`

Run container:

- `docker run -p 3000:3000 --env NEXT_PUBLIC_API_URL=http://localhost:5000 selfdirectedira-frontend`
