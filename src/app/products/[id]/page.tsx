import { ProductDetail } from "@/components/products/ProductDetail"
import { prisma } from "@/server/db"
import { notFound } from "next/navigation"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Use await for params to address the warning about synchronous usage
  const { id } = await Promise.resolve(params)

  try {
    // Fetch product details directly using Prisma instead of tRPC
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      notFound()
    }

    // Convert Decimal to number to fix "Only plain objects can be passed to Client Components"
    return (
      <ProductDetail
        product={{
          ...product,
          price:
            typeof product.price === "object" && product.price !== null
              ? Number(product.price.toString())
              : Number(product.price),
        }}
      />
    )
  } catch (error) {
    console.error("Error fetching product:", error)
    notFound()
  }
}
