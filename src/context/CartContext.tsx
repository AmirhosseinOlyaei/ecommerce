"use client"

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"

// Simple cart item structure without database dependencies
export type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string | null
}

type CartContextType = {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextType | null>(null)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on client-side only
  useEffect(() => {
    try {
      // Only run this once
      if (isInitialized) return

      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        // Validate cart data before setting
        if (
          Array.isArray(parsedCart) &&
          parsedCart.every(
            (item) =>
              typeof item === "object" &&
              typeof item.productId === "string" &&
              typeof item.name === "string" &&
              !isNaN(Number(item.price)) &&
              !isNaN(Number(item.quantity))
          )
        ) {
          // Ensure prices are always numbers
          const normalizedCart = parsedCart.map((item) => ({
            ...item,
            price: Number(item.price),
            quantity: Number(item.quantity),
          }))
          setItems(normalizedCart)
        } else {
          // Invalid cart data - clear it
          console.warn("Invalid cart data found in localStorage, clearing cart")
          localStorage.removeItem("cart")
        }
      }
      setIsInitialized(true)
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
      localStorage.removeItem("cart") // Clear potentially corrupted data
    }
  }, [isInitialized])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    // Only save after initialization to prevent overwriting cart on first load
    if (!isInitialized) return

    if (items.length > 0) {
      try {
        // Ensure all prices are valid numbers before saving
        const sanitizedItems = items.map((item) => ({
          ...item,
          price: Number(item.price),
          quantity: Number(item.quantity),
        }))
        localStorage.setItem("cart", JSON.stringify(sanitizedItems))
      } catch (error) {
        console.error("Failed to save cart to localStorage:", error)
      }
    } else {
      localStorage.removeItem("cart")
    }
  }, [items, isInitialized])

  const addToCart = (newItem: CartItem) => {
    // Ensure price is a valid number
    if (isNaN(Number(newItem.price)) || Number(newItem.price) <= 0) {
      console.error("Invalid price for item:", newItem)
      return
    }

    // Ensure quantity is valid
    if (isNaN(Number(newItem.quantity)) || Number(newItem.quantity) <= 0) {
      console.error("Invalid quantity for item:", newItem)
      return
    }

    // Normalize the item
    const normalizedItem = {
      ...newItem,
      price: Number(newItem.price),
      quantity: Number(newItem.quantity),
    }

    setItems((current) => {
      // Check if item already exists in cart
      const existingItemIndex = current.findIndex(
        (item) => item.productId === normalizedItem.productId
      )

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...current]
        updatedItems[existingItemIndex].quantity += normalizedItem.quantity
        return updatedItems
      } else {
        // Add new item
        return [...current, normalizedItem]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setItems((current) =>
      current.filter((item) => item.productId !== productId)
    )
  }

  const updateQuantity = (productId: string, quantity: number) => {
    // Validate quantity
    if (isNaN(quantity) || quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem("cart")
  }

  // Calculate derived values with validation to prevent NaN
  const itemCount = items.reduce((total, item) => {
    const qty = Number(item.quantity)
    return total + (isNaN(qty) ? 0 : qty)
  }, 0)

  const subtotal = items.reduce((total, item) => {
    const price = Number(item.price)
    const qty = Number(item.quantity)
    if (isNaN(price) || isNaN(qty)) return total
    return total + price * qty
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
