import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

const ORDER_STEPS = ["Pending", "Confirmed", "Processing", "Delivered"];

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.data.order);
      } catch (err) {
        setError(err.response?.data?.message || "Order not found");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return <p className="eyebrow max-w-3xl mx-auto px-6 py-20">Loading order…</p>;
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="font-display text-2xl mb-4">{error || "Order not found"}</p>
        <Link to="/orders" className="btn-secondary">
          Back to orders
        </Link>
      </div>
    );
  }

  const activeStepIndex = ORDER_STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "Cancelled";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to="/orders" className="text-xs text-moss-600 hover:underline">
        ← Back to orders
      </Link>

      <div className="flex items-baseline justify-between mt-4 mb-8">
        <h1 className="font-display text-3xl">Order #{order._id.slice(-8)}</h1>
        <span
          className={`text-sm font-medium ${isCancelled ? "text-clay" : "text-moss-600"}`}
        >
          {order.orderStatus}
        </span>
      </div>

      {!isCancelled && (
        <div className="flex items-center mb-10">
          {ORDER_STEPS.map((step, i) => (
            <div key={step} className="flex-1 flex items-center">
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  i <= activeStepIndex ? "bg-moss-500" : "bg-line"
                }`}
              />
              {i < ORDER_STEPS.length - 1 && (
                <div className={`flex-1 h-px ${i < activeStepIndex ? "bg-moss-500" : "bg-line"}`} />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="border border-line rounded-sm p-5 mb-6">
        <p className="eyebrow mb-3">Items</p>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>
                {item.title} × {item.quantity}
              </span>
              <span className="font-mono">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
        <div className="space-y-1.5 mt-4 pt-4 border-t border-line text-sm text-ink/70">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono">₹{order.subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span className="font-mono">₹{order.tax.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span className="font-mono">{order.deliveryFee === 0 ? "Free" : `₹${order.deliveryFee}`}</span>
          </div>
          <div className="flex justify-between text-base font-medium text-ink pt-2 border-t border-line">
            <span>Total</span>
            <span className="font-mono">₹{order.amount.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      <div className="border border-line rounded-sm p-5 mb-6">
        <p className="eyebrow mb-2">Delivery address</p>
        <p className="text-sm text-ink/70">
          {order.address.fullName} · {order.address.phone}
          <br />
          {order.address.line1}
          {order.address.line2 ? `, ${order.address.line2}` : ""}
          <br />
          {order.address.city}, {order.address.state} {order.address.postalCode}
        </p>
      </div>

      <div className="border border-line rounded-sm p-5">
        <p className="eyebrow mb-2">Payment</p>
        <p className="text-sm text-ink/70">
          Status:{" "}
          <span className={order.paymentStatus === "Successful" ? "text-moss-600" : "text-clay"}>
            {order.paymentStatus}
          </span>
        </p>
        <p className="text-xs text-ink/40 mt-1">
          Placed on{" "}
          {new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};

export default OrderDetails;
