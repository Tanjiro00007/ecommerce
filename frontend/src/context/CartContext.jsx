import { createContext, useContext, useState, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setCartLoading(true);
    try {
      const res = await api.get("/cart");
      setCart(res.data.data.cart);
    } catch (err) {
      // silent - navbar badge just won't update
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await api.post("/cart", { productId, quantity });
    setCart(res.data.data.cart);
    return res.data.data.cart;
  };

  const updateCartItem = async (productId, quantity) => {
    const res = await api.patch("/cart", { productId, quantity });
    setCart(res.data.data.cart);
    return res.data.data.cart;
  };

  const removeFromCart = async (productId) => {
    const res = await api.delete(`/cart/${productId}`);
    setCart(res.data.data.cart);
    return res.data.data.cart;
  };

  const itemCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartLoading,
        itemCount,
        refreshCart,
        addToCart,
        updateCartItem,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
