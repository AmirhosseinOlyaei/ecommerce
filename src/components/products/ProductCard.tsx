"use client";

import Image from "next/image";
import Link from "next/link";
import { type Product } from "@prisma/client";

interface ProductCardProps {
  product: Product & {
    images?: { url: string }[];
    category?: { name: string } | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0]?.url || "/product-placeholder.jpg";
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product.price);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 line-clamp-1">
          {product.name}
        </h3>
        <div className="mt-1 text-sm text-gray-500">
          {product.category?.name || "Uncategorized"}
        </div>
        <div className="mt-2 font-semibold text-gray-900">{formattedPrice}</div>
      </div>
    </Link>
  );
}
