# FinanceTracker Application

## Overview

This is a full-stack personal finance management application built with React (frontend) and Express.js (backend). The application helps users track their income, expenses, bills, investments, and provides AI-powered financial insights. It features a modern dashboard interface with data visualization, transaction management, and automated financial analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (July 15, 2025)

✓ Built complete financial tracker web application with:
  - Card-based UI design for utility bills (electricity, water, internet, car payments)
  - Manual transaction input with category selection
  - CSV file upload for bank statement imports
  - AI-powered financial insights and savings projections
  - Investment tracking for stocks, funds, and ETFs
  - Interactive charts and spending analysis
  - Mobile-responsive dashboard layout

✓ Added sample data including:
  - Monthly transactions across different categories
  - Utility bills with status tracking and card display
  - Income sources and investment portfolio
  - Budget tracking with spending limits

✓ Integrated OpenAI API for:
  - Automatic transaction categorization
  - Personalized financial insights
  - Savings projections and investment recommendations

✓ Replaced OpenAI with built-in mathematical analysis:
  - Advanced financial calculations for future net worth projections
  - Savings rate analysis and investment recommendations
  - Risk assessment based on spending patterns
  - 1-year, 5-year, and 10-year wealth projections

✓ Added PostgreSQL database integration:
  - Replaced in-memory storage with persistent PostgreSQL database
  - Implemented DatabaseStorage class with Drizzle ORM
  - Created database schema with proper relations
  - Added sample data initialization script

✓ Enhanced dashboard with Financial Health Score:
  - Replaced incomplete AI insights with comprehensive health scoring
  - Added 0-100 financial wellness score with progress visualization
  - Included key metrics: savings rate, cash flow, investment growth
  - Personalized recommendations based on financial health status

✓ Implemented missing functionality and fixed button responsiveness:
  - Added working Add Bill modal with comprehensive form fields
  - Created Set Budget Goals modal with category-based budgeting
  - Fixed all Quick Actions buttons to properly open modals
  - Added dedicated Transactions and Bills management pages
  - Implemented proper sidebar navigation with active state highlighting
  - Fixed menu button responsiveness and routing throughout the app

✓ Added comprehensive pages for all features:
  - Analytics page with interactive charts and spending trends
  - AI Insights page with financial health analysis and recommendations
  - Investments page with portfolio tracking and performance metrics
  - Import Data page with CSV upload and template download
  - Settings page with user preferences and account management
  - Profile page with user information and account statistics
  - Working profile dropdown menu with logout functionality

## System Architecture

### Full-Stack TypeScript Application
- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Hosting**: Neon Database for PostgreSQL hosting
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing

## Key Components

### Frontend Architecture
- **Component Library**: shadcn/ui components providing a comprehensive set of UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query for efficient server state management
- **Charts**: Recharts for data visualization
- **File Upload**: Multer for CSV file processing
- **Responsive Design**: Mobile-first approach with responsive breakpoints

### Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API with JSON responses
- **File Processing**: CSV parsing capabilities for bank statement imports
- **AI Integration**: OpenAI API for financial insights and recommendations
- **Session Management**: Session-based approach (connect-pg-simple for PostgreSQL sessions)

### Database Schema
- **Users**: Basic user management with username/password
- **Transactions**: Financial transactions with categories, amounts, dates, and payment methods
- **Bills**: Recurring bills and utilities with due dates and status tracking
- **Incomes**: Income sources with frequency and active status
- **Investments**: Investment portfolio tracking with symbols and performance
- **Budgets**: Budget categories with spending limits and tracking

## Data Flow

1. **Client Requests**: React components make API calls using TanStack Query
2. **Server Processing**: Express routes handle requests and interact with the database
3. **Database Operations**: Drizzle ORM performs type-safe database queries
4. **AI Processing**: OpenAI service analyzes financial data for insights
5. **Response Handling**: JSON responses are cached and managed by TanStack Query
6. **UI Updates**: React components re-render based on query state changes

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon Database connection for PostgreSQL
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components foundation
- **recharts**: Chart library for data visualization
- **react-hook-form**: Form handling and validation
- **zod**: Runtime type validation
- **tailwindcss**: Utility-first CSS framework

### AI and Processing
- **openai**: OpenAI API integration for financial insights
- **csv-parser**: CSV file processing for transaction imports
- **multer**: File upload handling

### Development Tools
- **vite**: Frontend build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Production build bundling

## Deployment Strategy

### Development Environment
- **Frontend**: Vite development server with HMR
- **Backend**: tsx for TypeScript execution with auto-reload
- **Database**: Neon Database connection via environment variables

### Production Build
- **Frontend**: Vite builds to `dist/public` directory
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend files in production

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string for Neon Database
- **OPENAI_API_KEY**: API key for OpenAI services
- **NODE_ENV**: Environment detection for development/production modes

### Key Architectural Decisions

1. **Monorepo Structure**: Single repository with shared types between frontend and backend
2. **Type Safety**: Full TypeScript implementation with shared schemas via Drizzle Zod
3. **Database-First**: Schema-driven development with Drizzle migrations
4. **Component-Based UI**: Modular design with shadcn/ui for consistency
5. **AI-Enhanced**: OpenAI integration for intelligent financial analysis
6. **File Import Support**: CSV processing for bank statement imports
7. **Responsive Design**: Mobile-first approach for cross-device compatibility

## Database setup (MySQL)

1. Provision a MySQL instance (local or cloud).
2. Add Spring Boot database configuration in `.env`:
```
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/finance
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_password
```
3. Start Spring Boot backend:
```
npm run dev:spring
```
4. Start React frontend:
```
npm run dev:frontend
```