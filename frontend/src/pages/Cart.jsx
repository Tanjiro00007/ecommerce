import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { cart, refreshCart, updateCartItem, removeFromCart, cartLoading } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;
    setBusyId(productId);
    setError("");
    try {
      await updateCartItem(productId, quantity);
    } catch (err) {
      setError(err.response?.data?.message || "Could not update quantity");
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (productId) => {
    setBusyId(productId);
    setError("");
    try {
      await removeFromCart(productId);
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove item");
    } finally {
      setBusyId(null);
    }
  };

  if (cartLoading && !cart) {
    return <p className="eyebrow max-w-4xl mx-auto px-6 py-20">Loading your cart…</p>;
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <p className="font-display text-3xl mb-3">Your cart is empty.</p>
        <p className="text-ink/60 mb-8">Find something worth carrying home.</p>
        <Link to="/" className="btn-primary">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <p className="eyebrow mb-2">Your bag</p>
      <h1 className="font-display text-4xl mb-8">Shopping Cart</h1>

      {error && <p className="text-clay text-sm mb-4">{error}</p>}

      <div className="divide-y divide-line border-y border-line">
        {items.map((item) => {
          const product = item.product;
          if (!product) return null;
          const busy = busyId === product._id;
          return (
            <div key={product._id} className="flex items-center gap-4 py-5">
              <div className="w-20 h-20 bg-moss-50 rounded-sm overflow-hidden shrink-0">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-moss-300 font-display text-xl">
                    {product.title.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link to={`/products/${product._id}`} className="font-display text-lg hover:text-moss-600">
                  {product.title}
                </Link>
                <p className="font-mono text-sm text-ink/60 mt-1">
                  ₹{item.price.toLocaleString("en-IN")} each
                </p>
              </div>

              <div className="flex items-center border border-line rounded-sm">
                <button
                  disabled={busy}
                  onClick={() => handleQuantityChange(product._id, item.quantity - 1)}
                  className="px-3 py-1.5 text-ink/60 hover:text-ink disabled:opacity-40"
                >
                  −
                </button>
                <span className="px-3 font-mono text-sm">{item.quantity}</span>
                <button
                  disabled={busy || item.quantity >= product.stock}
                  onClick={() => handleQuantityChange(product._id, item.quantity + 1)}
                  className="px-3 py-1.5 text-ink/60 hover:text-ink disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <p className="font-mono text-sm w-20 text-right">
                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
              </p>

              <button
                disabled={busy}
                onClick={() => handleRemove(product._id)}
                className="text-xs text-clay hover:underline disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 ml-auto max-w-xs space-y-2">
        <div className="flex justify-between text-sm text-ink/70">
          <span>Subtotal</span>
          <span className="font-mono">₹{cart.subtotal.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between text-sm text-ink/70">
          <span>Tax (18%)</span>
          <span className="font-mono">₹{cart.tax.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between text-sm text-ink/70">
          <span>Delivery</span>
          <span className="font-mono">
            {cart.deliveryFee === 0 ? "Free" : `₹${cart.deliveryFee}`}
          </span>
        </div>
        <div className="flex justify-between text-base font-medium pt-2 border-t border-line">
          <span>Total</span>
          <span className="font-mono">₹{cart.total.toLocaleString("en-IN")}</span>
        </div>

        <button onClick={() => navigate("/checkout")} className="btn-primary w-full mt-4">
          Proceed to checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
