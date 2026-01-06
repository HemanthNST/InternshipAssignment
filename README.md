# Smart Parking Management System - Project Architecture

## Overview

A comprehensive parking lot management system with 4 user roles: User, Driver, Manager, and Super Admin.

## Technology Stack

- **Frontend**: Next.js 14 + React 18 + Tailwind CSS (deployed on Vercel)
- **Backend**: Express.js + TypeScript (deployed on Render)
- **Database**: PostgreSQL via Supabase
- **Design**: Mobile-first responsive design

## Project Structure

```
BrandWorksUpdated/
├── frontend/                 # Next.js Frontend
│   ├── app/                  # Next.js app directory
│   │   ├── page.tsx          # Role selection landing page
│   │   ├── user/
│   │   │   └── page.tsx      # User dashboard (Home, Ticket, History, Settings)
│   │   ├── driver/
│   │   │   └── page.tsx      # Driver interface (Coming Soon)
│   │   ├── manager/
│   │   │   └── page.tsx      # Manager interface (Coming Soon)
│   │   ├── superAdmin/
│   │   │   └── page.tsx      # Super Admin interface (Coming Soon)
│   │   └── layout.tsx        # Root layout
│   ├── components/           # Reusable components
│   ├── lib/                  # Utility functions & API client
│   ├── store/                # Zustand state management
│   ├── types/                # TypeScript types
│   ├── styles/               # Global styles
│   ├── package.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── .env.local            # Frontend environment variables
│   └── .gitignore
│
├── backend/                  # Express.js Backend
│   ├── src/
│   │   ├── server.ts         # Main server file
│   │   ├── config/
│   │   │   └── supabase.ts   # Supabase configuration
│   │   ├── database/
│   │   │   └── schema.sql    # Database schema (camelCase)
│   │   ├── types/
│   │   │   └── env.d.ts      # Environment types
│   │   ├── routes/           # API routes (to be implemented)
│   │   ├── controllers/      # Route handlers (to be implemented)
│   │   ├── middleware/       # Custom middleware (to be implemented)
│   │   └── services/         # Business logic (to be implemented)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                  # Backend environment variables (secret)
│   └── .gitignore
│
├── INSTRUCTIONS.md           # Project requirements
├── USER_UI_WORKFLOW.md       # User role requirements
├── DRIVER_UI_WORKFLOW.md     # Driver role requirements (if provided)
└── README.md                 # This file
```
## Running the Project
### Frontend
```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:3000
```

### Backend
```bash
cd backend
npm install
npm run dev
# Backend runs on http://localhost:8000
```

## Notes
- All simulations are client-side (QR scanning, payment processing)
- No actual payments are processed
- Responsive design optimized for mobile devices
