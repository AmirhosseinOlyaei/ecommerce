import { ProductDetail } from "@/components/products/ProductDetail"
import { prisma } from "@/server/db"
import { notFound } from "next/navigation"

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Await the params promise
  const { id } = await params

  try {
    // Fetch product directly using Prisma but format data like the tRPC router
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      notFound()
    }

    // Format the product data exactly like the tRPC router does in getById
    return (
      <ProductDetail
        product={{
          ...product,
          // Convert Decimal to number consistent with how tRPC does it
          price: product.price.toNumber(),
        }}
      />
    )
  } catch (error) {
    console.error("Error fetching product:", error)
    notFound()
  }
}
