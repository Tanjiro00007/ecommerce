import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data.product);
        setRelated(res.data.data.relatedProducts);
        setQuantity(1);
      } catch (err) {
        setError(err.response?.data?.message || "Product not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    setAdding(true);
    setMessage("");
    setError("");
    try {
      await addToCart(product._id, quantity);
      setMessage("Added to cart");
    } catch (err) {
      setError(err.response?.data?.message || "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <p className="eyebrow max-w-6xl mx-auto px-6 py-20">Loading…</p>;
  }

  if (error && !product) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="font-display text-2xl mb-2">{error}</p>
        <button onClick={() => navigate("/")} className="btn-secondary mt-4">
          Back to shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-square bg-moss-50 rounded-sm overflow-hidden">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-moss-300 font-display text-6xl">
              {product.title.charAt(0)}
            </div>
          )}
        </div>

        <div>
          <p className="eyebrow mb-3">{product.category}</p>
          <h1 className="font-display text-4xl leading-tight mb-4">{product.title}</h1>
          <p className="font-mono text-2xl mb-6">₹{product.price.toLocaleString("en-IN")}</p>
          <p className="text-ink/70 leading-relaxed mb-6">{product.description}</p>

          <p className="text-sm mb-6">
            {product.stock > 0 ? (
              <span className="text-moss-600">In stock — {product.stock} available</span>
            ) : (
              <span className="text-clay">Out of stock</span>
            )}
          </p>

          {message && <p className="text-moss-600 text-sm mb-3">{message}</p>}
          {error && product && <p className="text-clay text-sm mb-3">{error}</p>}

          <div className="flex items-center gap-4">
            <div className="flex items-center border border-line rounded-sm">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-ink/60 hover:text-ink"
              >
                −
              </button>
              <span className="px-4 font-mono text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="px-3 py-2 text-ink/60 hover:text-ink"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="btn-primary flex-1"
            >
              {product.stock === 0 ? "Out of stock" : adding ? "Adding…" : "Add to cart"}
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <p className="eyebrow mb-4">You might also like</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
