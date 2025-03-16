import { createTRPCReact } from '@trpc/react-query'
import { type AppRouter } from '@/server/trpc'

export const api = createTRPCReact<AppRouter>()
