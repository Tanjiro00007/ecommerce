import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const statusColor = {
  Pending: "text-gold",
  Confirmed: "text-moss-600",
  Paid: "text-moss-600",
  Processing: "text-moss-600",
  Delivered: "text-moss-600",
  Cancelled: "text-clay",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        setOrders(res.data.data.orders);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <p className="eyebrow max-w-4xl mx-auto px-6 py-20">Loading your orders…</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <p className="eyebrow mb-2">Order history</p>
      <h1 className="font-display text-4xl mb-8">Your Orders</h1>

      {error && <p className="text-clay text-sm mb-6">{error}</p>}

      {orders.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-display text-2xl mb-2">No orders yet.</p>
          <Link to="/" className="btn-primary mt-4 inline-flex">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="flex items-center justify-between py-5 hover:bg-moss-50/50 transition-colors px-2 -mx-2"
            >
              <div>
                <p className="font-mono text-sm">#{order._id.slice(-8)}</p>
                <p className="text-xs text-ink/50 mt-1">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · {order.items.length} item{order.items.length > 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm">₹{order.amount.toLocaleString("en-IN")}</p>
                <p className={`text-xs mt-1 ${statusColor[order.orderStatus] || "text-ink/50"}`}>
                  {order.orderStatus}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
