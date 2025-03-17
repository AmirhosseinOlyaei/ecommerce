This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Next.js E-commerce Application

This e-commerce application uses Next.js with App Router, Prisma, tRPC, and Supabase to provide a MVP-featured e-commerce platform with user management, product catalog, cart functionality, and order processing.

## Live Demo

The application is deployed and available at: [https://ecommerce-app-lac-five-14.vercel.app/](https://ecommerce-app-lac-five-14.vercel.app/)

## Technology Stack

- **Next.js 15.2.2**: Frontend framework with App Router for page rendering
- **React 19**: Latest version of React with improved performance and features
- **Prisma 6.5.0**: Type-safe ORM for database access
- **tRPC 10.45.2**: End-to-end typesafe API with efficient data fetching
- **Supabase**: Authentication, user management, and storage
- **PostgreSQL**: Database for storing application data
- **TailwindCSS 4.0.13**: Utility-first CSS framework for styling
- **TypeScript 5**: For type safety across the codebase
- **Tanstack React Query**: For efficient data fetching and caching
- **Zod**: For runtime type validation
- **Sonner**: Toast notifications library

## Project Configuration

This project is configured to use [pnpm](https://pnpm.io/) as the package manager. The `.npmrc` file contains the following configuration:

```
engine-strict=true
auto-install-peers=true
shamefully-hoist=true
```

- `engine-strict=true`: Ensures the engine requirements in package.json are followed
- `auto-install-peers=true`: Automatically installs peer dependencies
- `shamefully-hoist=true`: Improves compatibility with packages that expect Node.js modules structure

## Getting Started

1. Clone the repository
2. Configure your environment variables (copy `.env.example` to `.env` and update as needed)
3. Run database migrations:

```bash
npx prisma migrate dev
```

4. Start the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to use the application

## API Routes

The API is built using tRPC and provides the following functionality:

- **User Management**: User registration, authentication, profile management
- **Product Management**: Create, read, update, and delete products
- **Order Processing**: Create and manage orders with various status options (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- **Cart Functionality**: Add, update, and remove items from the cart

## Authentication

Authentication is handled by Supabase with support for:

- Email/Password authentication
- Social provider authentication (Google, GitHub, etc.)
- Magic link authentication
- Row-level security for advanced authorization

## Database Schema

The application uses a PostgreSQL database with the following main models:
- Products
- Orders
- OrderItems

## Development Features

- **Turbopack**: Faster development with `--turbopack` flag enabled
- **ESLint 9**: Code linting for maintaining code quality
- **Prettier**: Code formatting
- **TanStack React Query DevTools**: For debugging data fetching

## Common pnpm Commands

```bash
# Install dependencies
pnpm install

# Install a new package
pnpm add [package-name]

# Install a dev dependency
pnpm add -D [package-name]

# Remove a package
pnpm remove [package-name]

# Run a script defined in package.json
pnpm [script-name]

# Build for production
pnpm build

# Start production server
pnpm start

# Format code
pnpm format

# Check formatting
pnpm format:check

# Lint code
pnpm lint
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

This project is currently deployed on Vercel and can be accessed at [https://ecommerce-app-lac-five-14.vercel.app/](https://ecommerce-app-lac-five-14.vercel.app/).

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
