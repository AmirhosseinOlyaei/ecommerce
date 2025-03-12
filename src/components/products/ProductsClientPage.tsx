"use client";

import { ProductList } from "./ProductList";

export function ProductsClientPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Our Products
        </h1>
        <p className="mt-4 text-xl text-gray-500">
          Browse our collection of products
        </p>
      </div>

      <ProductList />
    </div>
  );
}
