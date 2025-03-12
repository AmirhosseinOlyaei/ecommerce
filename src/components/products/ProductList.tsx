"use client";

import { useState } from "react";
import { api } from "@/lib/trpc/client";
import { ProductCard } from "./ProductCard";
import { type Category, type Product } from "@prisma/client";

export function ProductList() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );

  // Using tRPC to fetch products
  const { data, isLoading, error } = api.product.getAll.useQuery({
    limit: 12,
    categoryId: selectedCategory,
    onlyActive: true,
  });

  // Using tRPC to fetch categories
  const { data: categories } = api.category.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg">
        <h3 className="text-red-600 font-semibold">Error loading products</h3>
        <p className="text-gray-600 mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category filter */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={`px-3 py-1 text-sm rounded-full ${
              !selectedCategory
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {categories.map((category: Category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedCategory === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Products grid */}
      {data?.items && data.items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.items.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <h3 className="text-gray-600 font-semibold">No products found</h3>
          <p className="text-gray-500 mt-2">
            Try adjusting your filters or check back later.
          </p>
        </div>
      )}
    </div>
  );
}
