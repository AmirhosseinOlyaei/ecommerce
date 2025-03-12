This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Next.js E-commerce Application

This e-commerce application uses Next.js with App Router, Prisma, tRPC, and Supabase to provide a fully-featured e-commerce platform with user management, product catalog, cart functionality, and order processing.

## Technology Stack

- **Next.js**: Frontend framework with App Router for page rendering
- **Prisma**: Type-safe ORM for database access
- **tRPC**: End-to-end typesafe API with efficient data fetching
- **Supabase**: Authentication, user management, and storage
- **SQLite**: Database for local development (easily switched to PostgreSQL for production)
- **TailwindCSS**: Utility-first CSS framework for styling

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
- **Category Management**: Organize products by categories
- **Cart Functionality**: Add, update, and remove items from the cart
- **Order Processing**: Create and manage orders

## Authentication

Authentication is handled by Supabase with support for:

- Email/Password authentication
- Social provider authentication (Google, GitHub, etc.)
- Magic link authentication
- Row-level security for advanced authorization

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
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
