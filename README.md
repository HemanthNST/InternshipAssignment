# Smart Parking Management System

A comprehensive parking lot management system with role-based dashboards for Users, Drivers, Managers, and Super Admins.

## Overview

**Smart Parking** is a full-stack web application that simulates a complete parking lot management workflow:

- **Users** can park and retrieve vehicles, view tickets, and track parking history
- **Drivers** receive parking/retrieval assignments and manage their daily tasks
- **Managers** monitor all parking sessions, manage valets, and handle reassignments
- **Super Admins** oversee system-wide performance metrics and driver approvals across multiple parking sites

## Tech Stack

- **Frontend**: Next.js 14 + React 18 + Tailwind CSS (Vercel)
- **Backend**: Express.js + TypeScript (Render)
- **Database**: PostgreSQL via Supabase
- **Design**: Mobile-first responsive UI

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

### Backend

```bash
cd backend
npm install
npm run build
npm start
# http://localhost:8000
```

## Features

### User Dashboard

- Scan to park (simulated QR scanning)
- Select vehicle, location, and payment method
- View active parking details
- Track vehicle retrieval requests
- Browse recent parkings and history

### Driver Interface

- Receive parking/retrieval assignments
- Accept and complete assignments with simulated loading states
- Track daily statistics (parkings, retrievals, earnings)
- Real-time status updates on current assignment

### Manager Dashboard

- Search and filter parking sessions by status
- View car and customer details
- Call valets directly
- Reassign valets with a modal interface
- Track payments and parking locations

### Super Admin

- **Overview**: Site performance metrics, daily collections, statistics
- **Approvals**: Manage pending driver approvals with approve/reject actions
- Multi-site performance comparison

## Key Highlights

- Fully simulated workflows (no real payments/QR scanning)
- Responsive design optimized for mobile
- Dynamic site data (Hyderabad & Bangalore locations)
- Real-time status tracking across all roles
