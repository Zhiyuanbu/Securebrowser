
# Browser Application

A modern web browser application built with React, Express, and PostgreSQL. Features tabbed browsing, bookmarks, history tracking, and security settings.

## Features

- **Tabbed Browsing**: Multiple tabs with dynamic content loading
- **Bookmarks Management**: Save and organize your favorite websites
- **Browsing History**: Track and revisit previously visited pages
- **Security Settings**: Ad blocker, tracker protection, and malware protection
- **User Authentication**: Secure user sessions with Passport.js
- **Responsive Design**: Modern UI built with Tailwind CSS and Radix UI components

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Radix UI components
- React Query for state management
- Wouter for routing
- Framer Motion for animations

### Backend
- Express.js with TypeScript
- PostgreSQL with Drizzle ORM
- Passport.js for authentication
- Express sessions
- Zod for validation

## Getting Started

### Prerequisites
- Node.js
- PostgreSQL database

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your database connection in the environment variables

3. Push the database schema:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type check TypeScript
- `npm run db:push` - Push database schema

## Project Structure

```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities
│   │   └── pages/       # Page components
├── server/          # Express backend
├── shared/          # Shared types and schemas
└── README.md
```

## Database Schema

The application uses the following main entities:
- **Users**: User authentication and profiles
- **Tabs**: Browser tabs management
- **Bookmarks**: Saved bookmarks
- **History**: Browsing history tracking
- **Security Settings**: User security preferences

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
