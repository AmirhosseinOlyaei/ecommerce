// This is the server component for Next.js 15 compatibility
// It handles the params type requirements and renders the client component

import { EditProductClientPage } from "./client"

// Important: The server component must be async to satisfy Next.js 15 type constraints
export default async function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  // Perform a minimal async operation to satisfy the type requirements
  await Promise.resolve()

  // Pass the ID to the client component
  return <EditProductClientPage id={params.id} />
}
