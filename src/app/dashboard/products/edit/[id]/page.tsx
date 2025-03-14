// This is the server component for Next.js 15 compatibility
// It handles the params type requirements and renders the client component

import { EditProductClientPage } from "./client"

// Important: The server component must be async to satisfy Next.js 15 type constraints
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Await the params promise
  const resolvedParams = await params

  // Pass the ID to the client component
  return <EditProductClientPage id={resolvedParams.id} />
}
