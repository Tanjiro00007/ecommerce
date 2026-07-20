import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const Home = () => {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setPage(1);
  }, [search, sort, category]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const params = { page, limit: 12, sort };
        if (search) params.search = search;
        if (category) params.category = category;
        const res = await api.get("/products", { params });
        setProducts(res.data.data.products);
        setPagination(res.data.data.pagination);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, sort, category, search]);

  const categories = ["Electronics", "Fashion", "Home & Kitchen", "Furniture", "Sports"];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-10">
        <p className="eyebrow mb-2">
          {search ? `Results for "${search}"` : "The full catalog"}
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight max-w-2xl">
          Everyday goods, honestly priced.
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-line">
        <button
          onClick={() => setCategory("")}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            category === "" ? "bg-ink text-paper border-ink" : "border-line text-ink/60 hover:border-ink/40"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              category === c ? "bg-ink text-paper border-ink" : "border-line text-ink/60 hover:border-ink/40"
            }`}
          >
            {c}
          </button>
        ))}

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="ml-auto text-xs border border-line rounded-sm px-3 py-1.5 bg-white outline-none focus:border-moss-500"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-clay text-sm mb-6">{error}</p>}

      {loading ? (
        <p className="eyebrow">Loading products…</p>
      ) : products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-display text-2xl mb-2">Nothing here yet.</p>
          <p className="text-ink/60">Try a different search or category.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary !px-4 !py-2 text-xs"
              >
                Previous
              </button>
              <span className="font-mono text-xs text-ink/60">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="btn-secondary !px-4 !py-2 text-xs"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
