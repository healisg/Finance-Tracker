# Overview

This is a comprehensive personal finance tracking application built with a modern full-stack architecture. The application allows users to manage their financial data including transactions, savings, debts, investments, budgets, and financial goals through an intuitive web interface with real-time data visualization.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Styling**: Tailwind CSS with custom CSS variables for theming, featuring a dark gradient-based design
- **UI Components**: Radix UI primitives with shadcn/ui components for consistent, accessible interface elements
- **Charts**: Chart.js for financial data visualization including cash flow and expense category charts
- **Forms**: React Hook Form with Zod validation for robust form handling
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for end-to-end type safety
- **API Design**: RESTful API with structured route handling
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Comprehensive financial data models including users, transactions, savings pots, debts, investments, budgets, and financial goals
- **Validation**: Zod schemas for runtime type validation across client and server
- **Development**: Hot module replacement and development middleware integration

## Data Storage Solutions
- **Primary Database**: PostgreSQL for reliable ACID transactions and complex financial queries
- **ORM**: Drizzle ORM with schema-first approach and automatic TypeScript type generation
- **Migrations**: Drizzle Kit for database schema management and version control
- **Connection**: Neon serverless PostgreSQL for scalable cloud database hosting

## Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store using connect-pg-simple
- **User Model**: Basic user authentication with username/password and profile management
- **Security**: Environment-based configuration for database credentials and secure session handling

## External Dependencies
- **Database Provider**: Neon Database (@neondatabase/serverless) for serverless PostgreSQL hosting
- **UI Framework**: Radix UI component primitives for accessible, unstyled components
- **Validation**: Zod for runtime schema validation and type inference
- **Charts**: Chart.js for interactive financial data visualization
- **Date Handling**: date-fns for reliable date manipulation and formatting
- **Development Tools**: Replit-specific plugins for development environment integration and error handling