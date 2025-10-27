# Dashboard Meu Assessor

## Overview

Dashboard Meu Assessor is a Next.js-based investment dashboard application that integrates with the MyBroker API to display trading operations, portfolio performance, and financial projections. The application provides users with real-time data visualization, trade management, and personalized risk-based investment calculators.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Framework
**Next.js 16.0.0 with React 19.2.0**
- **Architecture Pattern**: App Router (Next.js 13+ directory structure)
- **Rationale**: Leverages modern React Server Components and file-based routing for improved performance and developer experience
- **Rendering Strategy**: Client-side rendering with "use client" directives for interactive components
- **State Management**: React hooks (useState, useEffect) with localStorage for persistence

### UI Component Library
**Radix UI with shadcn/ui**
- **Component System**: Comprehensive set of accessible, unstyled primitives wrapped with custom styling
- **Styling**: Tailwind CSS with CSS variables for theming
- **Design System**: Custom color palette using OKLCH color space for dark mode support
- **Pros**: Highly accessible, customizable, and production-ready components
- **Cons**: Requires manual component updates and maintenance

### Typography
**Multi-font Stack**
- **Primary**: Roboto (400, 500, 600, 700) for body text
- **Accent 1**: Public Sans (800) for headings
- **Accent 2**: Poppins (400, 700) for special elements
- **Rationale**: Provides visual hierarchy and brand consistency across the application

### Authentication & Authorization
**Token-based Authentication**
- **Storage**: localStorage for API token persistence
- **Flow**: Users enter API token on profile page, which is validated against MyBroker API
- **Session Management**: Token stored locally and included in all API requests via `api-token` header
- **Limitation**: No server-side session management; relies on client-side storage

### Data Visualization
**Recharts Library**
- **Chart Types**: Area charts for balance trends and result projections
- **Data Processing**: Client-side aggregation and filtering of trade data by date ranges
- **Responsiveness**: ResponsiveContainer wrapper for adaptive sizing

### Routing & Navigation
**File-based Routing Structure**
- `/` - Dashboard home with overview cards and charts
- `/perfil` - User profile and API token management
- `/operacoes` - Detailed operations/trades table
- `/tutoriais` - Video tutorials with YouTube integration
- `/login` - Authentication page (simulated login)

### Client-Side Data Management
**localStorage Usage**
- User preferences (profile image, API token)
- Saved projections from calculator
- Notification history
- Authentication state
- **Rationale**: Provides offline-first experience and reduces server load
- **Trade-off**: Data not synced across devices

### Date & Time Handling
**date-fns Library**
- Portuguese (Brazil) locale for date formatting
- Client-side date range filtering
- Month-based data aggregation

### Notification System
**Custom Event-based Notifications**
- Browser's CustomEvent API for cross-component communication
- localStorage persistence for notification history
- Types: trade success/failure, deposits, withdrawals, level-up events
- **Limitation**: Notifications are client-generated based on trade results, not real-time from API

## External Dependencies

### MyBroker API
**Base URL**: `https://broker-api.mybroker.dev`

**Authentication**: Header-based token authentication (`api-token`)

**Key Endpoints**:
- `GET /token/users/me` - User profile information
- `GET /token/trades` - Paginated trades list (supports page and pageSize parameters)
- `GET /token/trades/{id}` - Individual trade details
- `GET /token/wallets` - User wallet balances
- `POST /token/trades/open` - Open new trade positions

**Data Models**:
- **UserData**: User profile with tenant, email, name, country, language, verification status
- **Trade**: Trade records with symbol, amount, status (COMPLETED/CANCELLED/PENDING/OPEN), direction (BUY/SELL), PnL, prices, timestamps
- **Wallet**: User balance information

**Response Patterns**: Paginated responses with metadata (currentPage, perPage, total, data array)

### YouTube Integration
**YouTube IFrame API**
- Embedded video player for tutorials
- Client-side player state management
- Video progress tracking
- **Implementation**: Direct script injection and global API initialization

### Vercel Analytics
**Performance Monitoring**
- Client-side analytics tracking
- Integrated via `@vercel/analytics/next` package

### Chart.js
**Charting Library**
- Included via CDN in index.html
- Used alongside Recharts for specific visualization needs

### Third-Party UI Libraries
- **Radix UI**: Comprehensive set of primitives (accordion, alert-dialog, avatar, calendar, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, navigation-menu, popover, radio-group, select, slider, switch, tabs, toast, tooltip)
- **cmdk**: Command palette functionality
- **embla-carousel-react**: Carousel components
- **input-otp**: OTP input handling
- **lucide-react**: Icon library (v0.454.0)
- **next-themes**: Theme management for dark/light mode
- **react-hook-form**: Form state management with @hookform/resolvers for validation
- **vaul**: Drawer component primitives

### Development Tools
- **TypeScript**: Type safety with strict mode enabled
- **ESLint**: Code quality and consistency
- **Autoprefixer**: CSS vendor prefixing

### Build & Deployment Configuration
- **Custom Server Settings**: Runs on port 5000, binding to 0.0.0.0 for external access
- **Webpack Mode**: Development and production mode with webpack enabled (Turbopack disabled due to instability in Next.js 16.0.0)
- **Build Target**: ES6 with JSX as react-jsx
- **Deployment**: Configured for Replit autoscale deployment with build (`npm run build`) and run (`npm run start`) commands

## Recent Changes

### October 26, 2025 - Vercel to Replit Migration
**Migration from Vercel to Replit environment completed**
- **Compiler Switch**: Changed from Turbopack to webpack in development mode due to Turbopack panics in Next.js 16.0.0
  - Updated package.json scripts to use `--webpack` flag
  - Rationale: Turbopack exhibited internal errors during compilation on Replit; webpack provides stable compilation
- **Network Configuration**: Updated dev and start scripts to bind to `0.0.0.0:5000`
  - Required for Replit's networking architecture where apps run in containers
  - Port 5000 is the only non-firewalled port for frontend servers
- **Deployment Configuration**: Configured autoscale deployment in `.replit`
  - Build command: `npm run build`
  - Run command: `npm run start`
  - Deployment target: autoscale (stateless website mode)
- **Migration Status**: Complete and verified
  - Application runs without critical errors
  - All routes functional (/, /login, /perfil, /operacoes, /tutoriais)
  - Minor non-blocking warnings present (allowedDevOrigins, hydration, autocomplete attributes)

**Notes for Future Maintenance**:
- Monitor Next.js allowedDevOrigins warning before framework's breaking change
- Consider re-enabling TypeScript strict checking once type issues are resolved (currently using `ignoreBuildErrors: true`)
- Webpack mode is stable; consider testing Turbopack again in future Next.js releases

### October 26, 2025 - PostgreSQL Database Integration
**Database persistence added for user data (profile images and preferences only)**
- **Database Provider**: Replit's built-in Neon PostgreSQL database
- **ORM**: Drizzle ORM with @neondatabase/serverless driver
- **Schema Design** (`shared/schema.ts`):
  - `users` table with columns: id, email (unique), profile_image, preferences (JSON), created_at, updated_at
  - **Security Decision**: API tokens are NOT stored in the database for security reasons
- **API Routes**:
  - `GET /api/user?email={email}` - Retrieve user data by email
  - `POST /api/user` - Create or update user profile and preferences
  - `POST /api/upload` - Handle profile image uploads to server storage
- **Data Synchronization Strategy**:
  - Profile images and preferences sync across devices via database
  - API tokens remain in localStorage only (device-specific for security)
  - Users must re-enter API token on new devices
- **Error Handling**: Safe JSON parsing with `safeParseJSON` helper to handle empty or malformed preference strings
- **Module Path Fix**: Corrected import path from `@shared/schema` to `@/shared/schema` to match Next.js alias configuration
- **Webpack Cache Management**: Required `.next` folder deletion after path changes for clean compilation
- **Integration**: Used Replit's javascript_database integration for seamless database setup

**Rationale for Security Decisions**:
- API tokens are sensitive credentials that should not be stored in databases (even encrypted)
- Reversible encryption would require secure key management infrastructure
- Device-specific token storage is more secure than database synchronization
- Only non-sensitive data (profile images, UI preferences) are synchronized

**Upload Security** (`app/api/upload/route.ts`):
- User verification (checks user exists in database before allowing upload)
- Magic byte validation (validates actual file content, not just extension)
- MIME type validation (only image/* types allowed)
- File extension whitelist (jpg, jpeg, png, gif, webp)
- File size limit (5MB maximum)
- Sanitized filenames to prevent path traversal attacks
- **Mitigates**: Basic XSS protection and file type validation

**Known Security Limitations**:
- **No true authentication**: Application uses localStorage-based authentication without server-side sessions/JWT
- **User creation**: POST /api/user allows unauthenticated user creation (by design for localStorage sync)
- **Upload authorization**: Email-based verification is not true authentication; any user who knows an email can upload
- **For Production Use**: Implement proper authentication system (sessions/JWT), restrict user creation, and consider moving uploads outside public directory with access-controlled serving

**Rationale**: Current design prioritizes localStorage-first architecture with database as sync layer. True multi-user authentication would require fundamental architectural changes including:
- Server-side session management or JWT tokens
- Secure user registration/login flow
- Protected API endpoints with authorization middleware
- Non-public file storage with signed URLs

**Files Modified**:
- `shared/schema.ts` - Database schema definition
- `server/db.ts` - Database connection and Drizzle configuration
- `drizzle.config.ts` - Drizzle Kit configuration for migrations
- `app/api/user/route.ts` - User data CRUD operations with safe JSON parsing
- `app/api/upload/route.ts` - Secure image upload handler with validation
- `app/perfil/page.tsx` - Frontend integration with database APIs