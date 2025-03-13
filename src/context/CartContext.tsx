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

  // Load cart from localStorage on client-side only
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items])

  const addToCart = (newItem: CartItem) => {
    setItems((current) => {
      // Check if item already exists in cart
      const existingItemIndex = current.findIndex(
        (item) => item.productId === newItem.productId
      )

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...current]
        updatedItems[existingItemIndex].quantity += newItem.quantity
        return updatedItems
      } else {
        // Add new item
        return [...current, newItem]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setItems((current) =>
      current.filter((item) => item.productId !== productId)
    )

    // If cart becomes empty, remove from localStorage
    if (items.length <= 1) {
      localStorage.removeItem("cart")
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
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

  // Calculate derived values
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

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
