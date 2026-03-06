# EduPlatform - Student Learning Management System

A modern, comprehensive Learning Management System (LMS) built with React, TypeScript, and Tailwind CSS. Features a clean, professional design with full responsiveness and accessibility.

## Features

### Core Pages
- **Dashboard**: Overview of student activities, notifications, stats, and upcoming events
- **Courses**: Browse and manage enrolled courses with progress tracking
- **Videos**: Video player with playlist and progress tracking
- **Progress and Analytics**: Visual charts and graphs showing performance metrics
- **Assignments**: View, filter, and manage assignments and tests
- **Submissions**: Upload and submit assignment files with rich text editor
- **Fees and Payments**: Payment history, methods, and upcoming payments
- **AI Study Assistant**: Interactive AI chatbot for study recommendations

### Design Features
- **Modern UI**: Clean, professional design with soft education-themed colors
- **Responsive**: Fully responsive layout that works on desktop, tablet, and mobile
- **Accessible**: Built with accessibility in mind using semantic HTML and ARIA labels
- **Consistent**: Reusable components with a cohesive design system
- **Interactive**: Smooth animations and transitions for better UX

### Technical Stack
- **React 18** with TypeScript
- **Tailwind CSS 4** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **Radix UI** components for accessibility
- **shadcn/ui** component library

## Setup

This repo includes:
- Frontend (Vite + React) in the project root
- Backend API (Express + MongoDB) in `server/`

### 1) Environment variables

Frontend:
- Copy `.env.example` → `.env`
- Set `VITE_API_BASE_URL` (default: `http://localhost:5000`)

Backend:
- Copy `server/.env.example` → `server/.env`
- Set `MONGO_URI` and `JWT_SECRET`

### 2) Install dependencies

```bash
npm install
npm --prefix server install
```

### 3) (Optional) Seed sample data

```bash
npm --prefix server run seed
```

Seeded demo accounts:
- Admin: `admin@learnix.com` / `admin123`
- Student: `student@learnix.com` / `student123`

### 4) Run the app

In two terminals:
```bash
npm --prefix server run dev
npm run dev
```

Or run both together:
```bash
npm run dev:full
```

## Production Checklist

1. Set secure backend env values in `server/.env`:
- `NODE_ENV=production`
- `JWT_SECRET` to a long random value (16+ chars)
- `MONGO_URI` to your production DB
- `CORS_ORIGIN` to your deployed frontend origin(s), comma-separated if multiple
- `PUBLIC_BASE_URL` to your backend public URL (used for uploaded file links)

2. Build frontend:
```bash
npm run build
```

3. Run backend in production mode:
```bash
npm --prefix server run start
```

4. Configure your reverse proxy (Nginx/Cloudflare/Vercel) to:
- Serve frontend static build
- Forward `/api/*` and `/uploads/*` to backend

5. Security notes:
- Public registration now creates only `student` users.
- Admin/instructor role assignment is backend-protected.
- Rate limiting and strict CORS checks are enabled.

## Pages Overview

### 1. Dashboard
- Welcome banner with hero image
- Quick stats (Active Courses, Completed, Study Hours, Avg Score)
- Recent activity feed
- Notifications panel
- Upcoming events and deadlines

### 2. Courses
- Grid layout of course cards
- Course progress indicators
- Search and filter functionality
- Status badges (In Progress, Completed, Not Started)
- Course details (instructor, duration, students, rating)

### 3. Videos
- Full-featured video player
- Course playlist with completion tracking
- Video controls (play, pause, volume, fullscreen)
- Progress bar for both video and overall course
- Video description and metadata

### 4. Progress and Analytics
- Performance trend charts (line chart)
- Weekly study hours (bar chart)
- Course completion pie chart
- Grade distribution
- Achievement badges
- Key performance indicators

### 5. Assignments and Tests
- New assignments section
- Filter by status and type
- Assignment cards with priority levels
- Due date indicators
- Quick action buttons

### 6. Submissions
- Assignment details and requirements
- Rich text editor with formatting tools
- Drag-and-drop file upload
- Multiple file support
- Previous submissions history
- Save draft functionality

### 7. Fees and Payments
- Financial overview dashboard
- Payment summary cards
- Multiple payment methods
- Tuition fee breakdown
- Transaction history table
- Upcoming payments
- Download receipts

### 8. AI Study Assistant
- Interactive chat interface
- AI-powered study recommendations
- Chat history
- Suggested prompts
- Study suggestions panel
- Quick action buttons

## Color Palette

The platform uses a modern, education-friendly color scheme:
- **Primary**: Indigo (600/700) - Main actions and highlights
- **Secondary**: Purple - Gradients and accents
- **Success**: Green - Completed states
- **Warning**: Amber/Orange - Pending items
- **Danger**: Red - Urgent notifications
- **Neutral**: Gray scale - Text and backgrounds

## Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Mobile features:
- Collapsible sidebar with overlay
- Hamburger menu
- Stacked layouts
- Touch-friendly buttons

## Component Structure

```
src/
|-- app/
|   |-- components/
|   |   |-- ui/              # Reusable UI components
|   |   |-- pages/           # Page components (student and admin)
|   |   |-- Sidebar.tsx      # Navigation sidebar
|   |   `-- Header.tsx       # Top header with search
|   `-- App.tsx              # Main application
`-- styles/                  # Global styles
```

## Future Enhancements

- Real backend integration (Supabase or similar)
- User authentication and authorization
- Real-time notifications
- Live video streaming
- Calendar integration
- Mobile app version
- Dark mode theme
- Multi-language support
- Export functionality for reports
- Integration with video platforms (YouTube, Vimeo)

## Development

This is a production-ready frontend application. To add backend functionality:
1. Connect to Supabase or your preferred backend
2. Add authentication flows
3. Implement real-time data fetching
4. Add file upload handling
5. Integrate payment gateway

## Credits

Built with modern web technologies and best practices for educational institutions.
