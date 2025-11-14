# EzTweak – Harm Reduction Order & Case Management System

<img width="200" alt="Medicine Wheel Theme" src="https://github.com/user-attachments/assets/3fa3dc03-5260-469a-80cc-a6c392ca3e9a" />
<img width="200" alt="Neon Theme" src="https://github.com/user-attachments/assets/6fb90b90-9f9e-40f1-add7-0f44e0766dad" />

## Overview

EzTweak (Tweak Easy) is a comprehensive, professional-grade web application designed to support harm reduction outreach teams in delivering effective services to clients. The platform streamlines order placement, case management, incident reporting, and referral operations for staff, while also empowering clients to arrange delivery and pickup of harm reduction supplies.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development Mode
```bash
npm run dev
```
This starts both the React frontend (port 3000) and Express backend (port 5000) concurrently.

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### Production Build
```bash
npm run build
npm start
```

### Demo Credentials
- **Username**: `admin`
- **Password**: `admin123`

## 🎨 Dual Theme System

The application features two beautiful themes that can be toggled with a single click:

- **Medicine Wheel Theme**: Warm, indigenous-inspired earth tones (beige, brown, red, yellow)
- **Neon Theme**: Modern blue/purple gradient with glowing effects

## ✨ Features Implemented

### 🔐 Authentication & Security
- Secure login and registration system
- JWT-based authentication
- Role-based access control (Client, Staff, Admin)
- Password hashing with bcrypt
- SQL injection protection via parameterized queries
- Session management

### 📦 Order Management for Staff
Outreach staff can quickly and efficiently place or fill orders for harm reduction supplies on behalf of clients while engaged in field work.

**Unique Product Card Interface:**
- Each product displayed as a colorful widget with custom colors
- Product name, description, category, and stock quantity
- Custom SVG icons for each supply type
- **Bubble Counter System** (as requested):
  - Click product to add to cart
  - **Green bubble** with quantity appears in **top-right corner**
  - **Red bubble** with minus (-) button appears in **top-left corner**
  - Click minus to remove one item
  - Real-time cart summary shows total items
  
**10 Pre-loaded Harm Reduction Supplies:**
1. Syringes (1ml)
2. Naloxone Kits
3. Alcohol Swabs
4. Sharps Containers
5. Condoms
6. Sterile Water
7. Cookers
8. Cotton Filters
9. Tourniquets
10. Bandages 

Client Self-Service:
Clients can log in to the platform to schedule harm reduction deliveries or pickups based on staff availability. The process is straightforward, allowing users to choose items, preferred dates, and specific drop-off/pickup locations.

Case Management:
Detailed case records are maintained for each client, including notes, service history, follow-up actions, and privacy features. Staff can access and update cases securely, ensuring continuity of care and informed decision-making.

Incident Reporting & Referrals:
Staff can file incident reports directly within the system and generate or manage referrals to appropriate external service providers (health/social support), tracking outcomes and feedback.

Dashboard Analytics:
Advanced analytics and reporting tools help administrators and staff visualize outreach data. Dynamic graphs, charts, and KPIs (Key Performance Indicators) provide insights on inventory usage, client engagement, trends in service delivery, and incident rates.

Inventory Tracking:
Real-time inventory management ensures accurate reporting of supplies distributed during outreach. Staff can track available stock, usage rates, and reorder needs.

User Customization:
Each user, including staff and clients, can configure their dashboard—such as adding products to favorites for quick access, customizing navigation panels, and updating profile images/icons.

3D Professional UI/UX:
The interface is modern, responsive, and visually engaging, featuring 3D-styled navigation bars, dynamic dashboard widgets, animated transitions, modal dialogs for key actions, and intuitive iconography for enhanced usability.

Security & Access Control:
All sensitive operations (orders, case notes, reporting) are protected via secure authentication, with role-based permissions for clients, staff, and administrators. SQL injection protection is built in.

Ease of Use:
Designed for both staff and clients, the app prioritizes a simple and efficient workflow—ensuring outreach teams can focus on direct services and that clients can access harm reduction resources with minimal friction.

Summary Statement:
Tweak Easy is an adaptive, user-friendly platform that unifies harm reduction supply distribution, case/client management, incident tracking, referral coordination, and analytics/reporting for outreach organizations. Its professional, stylish responsive web interface is tailored to the realities of fieldwork, supporting both staff and clients in the pursuit of positive health and social outcomes.
