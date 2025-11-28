# Memr

AI-powered second brain.

Memr is a local-first, notion-like, AI-powered knowledge manager that unifies notes, tasks, and resources. It uses context-aware AI to help you capture, organize, and retrieve information efficiently.

## What It Solves

- **Information Overload**: Centralize all your notes, tasks, and projects in one place
- **Context Loss**: AI assistant understands your notes and tasks, providing relevant help
- **Offline Access**: Local-first architecture ensures your data is always accessible, even without internet
- **Fragmented Workflows**: Manage projects, todos, and resources seamlessly in a single app
- **Organization Overhead**: AI-powered auto-organization (coming soon) reduces manual categorization

## Core Features

- **Notion-like note taking**: Rich text editor with markdown support and formatting
- **Note collection management**: Organize notes into collections for better structure
- **Simple task management**: Create and track tasks with due dates
- **Local-first architecture**: Data is stored safely in your browser (IndexedDB) and seamlessly syncs to the cloud when online
- **Progressive Web App**: Works offline and can be installed on any device
- **AI assistant with note and task context**: Get intelligent help based on your content
- **[TODO] Auto organize notes and tasks**: AI-powered automatic categorization and organization
- **[TODO] Transcribe speech to text input**: Voice input for hands-free note creation
- **[TODO] In note AI assistant**: Context-aware AI assistance directly within your notes

## Tech Stack

### Frontend (`web/`)

- **React** 19 with **Vite**
- **TypeScript**
- **Tailwind CSS** + **ShadCN UI**
- **TipTap** (rich text editor)
- **React Query** (data fetching)
- **Dexie** (IndexedDB for local storage)
- **React Router** (routing)
- **Google OAuth** (authentication)
- **PWA**

### Backend (`api/`)

- **Go** 1.24+ with **Fiber** (web framework)
- **PostgreSQL** with **GORM**
- **Google OAuth** + **JWT**
- **OpenAI API** (AI features)
- **Zap** (logging)
- **Swagger** (API documentation)

## Folder Structure

This project consists of two main folders:

- **`api/`** - Backend REST API built with Go Fiber
- **`web/`** - Frontend application built with React and Vite
