import { ProductDetail } from "@/components/products/ProductDetail"
import { prisma } from "@/server/db"
import { notFound } from "next/navigation"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = params

  try {
    // Fetch product details directly using Prisma instead of tRPC
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      notFound()
    }

    return <ProductDetail product={product} />
  } catch (error) {
    console.error("Error fetching product:", error)
    notFound()
  }
}
