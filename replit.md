# Replit.md

## Overview

This is an AI-powered interview preparation platform built with modern web technologies. The application helps users practice for job interviews by generating questions using AI models (Anthropic Claude and Google Gemini), providing real-time feedback, and tracking progress over time. Users can customize their practice sessions by selecting job roles, question types (technical, behavioral, or mixed), and difficulty levels.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built using React 18 with TypeScript, utilizing modern patterns and libraries:

- **UI Framework**: React with Vite for fast development and building
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, accessible UI components
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Context-based auth system with protected routes

### Backend Architecture
The server follows a REST API pattern built on Express.js:

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for HTTP server and routing
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Management**: Express-session with PostgreSQL store in production, memory store for development

### Database Layer
The application uses a PostgreSQL database with Drizzle ORM:

- **ORM**: Drizzle for type-safe database operations
- **Database**: PostgreSQL (Neon serverless driver)
- **Schema**: Three main entities - users, interviews, and questions
- **Migrations**: Drizzle-kit for schema management

### Key Data Models
- **Users**: Authentication and profile information
- **Interviews**: Session metadata including role, difficulty, type, completion status, and scores
- **Questions**: Individual questions with user answers, AI feedback, and scoring

### AI Integration
Dual AI provider support with fallback mechanisms:

- **Primary Providers**: Anthropic Claude 3.7 Sonnet and Google Gemini 1.5 Pro
- **Question Generation**: AI generates contextual questions based on job role, difficulty, and type
- **Feedback System**: AI evaluates user answers and provides structured feedback with scoring
- **Fallback System**: Pre-defined question sets when AI services are unavailable

### Authentication & Security
- **Session-based Authentication**: Secure session management with HttpOnly cookies
- **Password Hashing**: Scrypt-based password hashing with salt
- **Protected Routes**: Client-side route protection with authentication checks
- **CSRF Protection**: Session-based protection against cross-site request forgery

### User Experience Features
- **Responsive Design**: Mobile-first design with adaptive layouts
- **Dark/Light Theme**: System-preference aware theme switching
- **Real-time Feedback**: Immediate AI-powered feedback after each answer
- **Progress Tracking**: Interview history and performance analytics
- **Speech Recognition**: Browser-based speech-to-text for answer input
- **Timer System**: Question-based timing for interview simulation

## External Dependencies

### AI Services
- **Anthropic API**: Primary AI provider for question generation and feedback using Claude models
- **Google Gemini API**: Secondary AI provider with automatic fallback capabilities

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket support
- **Session Storage**: PostgreSQL-backed session store for production environments

### Development Tools
- **Vite**: Frontend build tool and development server
- **Drizzle Kit**: Database migration and schema management
- **Replit Integration**: Development environment integration with error overlay and cartographer

### UI & Styling Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library for consistent iconography

### Utility Libraries
- **TanStack Query**: Server state management and data fetching
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime schema validation
- **date-fns**: Date manipulation and formatting