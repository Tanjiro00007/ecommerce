import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const initialAddress = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

const STEPS = ["Address", "Review", "Payment"];

const Checkout = () => {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({ ...initialAddress, fullName: user?.name || "" });
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddressChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setStep(1);
  };

  const handleCreateOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/orders", { address });
      setOrder(res.data.data.order);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create order");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError("");
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Could not load payment gateway. Check your connection and try again.");
        setLoading(false);
        return;
      }

      const { data } = await api.post("/payment/create-order", { orderId: order._id });
      const { key, gatewayOrderId, amount, currency } = data.data;

      const rzp = new window.Razorpay({
        key,
        amount,
        currency,
        name: "Market & Co.",
        description: `Order #${order._id.slice(-8)}`,
        order_id: gatewayOrderId,
        prefill: {
          name: address.fullName,
          contact: address.phone,
          email: user?.email,
        },
        theme: { color: "#14171F" },
        handler: async (response) => {
          try {
            await api.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await refreshCart();
            navigate(`/orders/${order._id}`, { replace: true });
          } catch (err) {
            setError(
              err.response?.data?.message ||
                "Payment verification failed. If money was deducted, it will be refunded automatically."
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment window closed before completing payment.");
          },
        },
      });

      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Could not start payment");
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="font-display text-2xl mb-2">Your cart is empty.</p>
        <button onClick={() => navigate("/")} className="btn-primary mt-4">
          Browse products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <p className="eyebrow mb-2">Checkout</p>
      <h1 className="font-display text-4xl mb-8">Complete your order</h1>

      <div className="flex items-center gap-2 mb-10 text-xs font-mono">
        {STEPS.map((s, i) => (
          <span key={s} className={`px-2 py-1 rounded-full ${i <= step ? "bg-ink text-paper" : "bg-line text-ink/50"}`}>
            {i + 1}. {s}
          </span>
        ))}
      </div>

      {error && (
        <div className="bg-clay/10 border border-clay/30 text-clay text-sm px-4 py-3 rounded-sm mb-6">
          {error}
        </div>
      )}

      {step === 0 && (
        <form onSubmit={handleAddressSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">Full name</label>
              <input required name="fullName" value={address.fullName} onChange={handleAddressChange} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Phone</label>
              <input required name="phone" value={address.phone} onChange={handleAddressChange} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">Address line 1</label>
            <input required name="line1" value={address.line1} onChange={handleAddressChange} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">Address line 2 (optional)</label>
            <input name="line2" value={address.line2} onChange={handleAddressChange} className="input-field" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">City</label>
              <input required name="city" value={address.city} onChange={handleAddressChange} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">State</label>
              <input required name="state" value={address.state} onChange={handleAddressChange} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Postal code</label>
              <input required name="postalCode" value={address.postalCode} onChange={handleAddressChange} className="input-field" />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full mt-4">
            Continue to review
          </button>
        </form>
      )}

      {step === 1 && (
        <div>
          <div className="border border-line rounded-sm p-5 mb-6">
            <p className="eyebrow mb-2">Deliver to</p>
            <p className="text-sm">
              {address.fullName} · {address.phone}
              <br />
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
              <br />
              {address.city}, {address.state} {address.postalCode}
            </p>
            <button onClick={() => setStep(0)} className="text-xs text-moss-600 hover:underline mt-3">
              Edit address
            </button>
          </div>

          <div className="border border-line rounded-sm p-5 mb-6 space-y-2">
            <p className="eyebrow mb-2">Order summary</p>
            {cart.items.map((item) => (
              <div key={item.product._id} className="flex justify-between text-sm">
                <span>
                  {item.product.title} × {item.quantity}
                </span>
                <span className="font-mono">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
              </div>
            ))}
            <div className="flex justify-between text-base font-medium pt-3 mt-3 border-t border-line">
              <span>Total</span>
              <span className="font-mono">₹{cart.total.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <button onClick={handleCreateOrder} disabled={loading} className="btn-primary w-full">
            {loading ? "Placing order…" : "Place order & continue to payment"}
          </button>
        </div>
      )}

      {step === 2 && order && (
        <div className="text-center py-10">
          <p className="font-display text-2xl mb-2">Order #{order._id.slice(-8)} created</p>
          <p className="text-ink/60 mb-8">
            Total due: <span className="font-mono">₹{order.amount.toLocaleString("en-IN")}</span>
          </p>
          <button onClick={handlePayment} disabled={loading} className="btn-primary">
            {loading ? "Opening payment…" : "Pay with Razorpay"}
          </button>
          <p className="text-xs text-ink/40 mt-4">
            You'll be redirected to Razorpay's secure checkout. We never see or store your card details.
          </p>
        </div>
      )}
    </div>
  );
};

export default Checkout;
