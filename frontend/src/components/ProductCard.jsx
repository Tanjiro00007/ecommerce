import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const image = product.images?.[0];

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block border border-line bg-white rounded-sm overflow-hidden hover:border-ink/30 transition-colors"
    >
      <div className="aspect-square bg-moss-50 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-moss-300 font-display text-3xl">
            {product.title.charAt(0)}
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="eyebrow mb-1">{product.category}</p>
        <h3 className="font-display text-lg leading-snug mb-1 line-clamp-2">
          {product.title}
        </h3>
        <div className="flex items-baseline justify-between mt-2">
          <span className="font-mono text-base">₹{product.price.toLocaleString("en-IN")}</span>
          {product.stock === 0 ? (
            <span className="text-xs text-clay">Out of stock</span>
          ) : product.stock < 10 ? (
            <span className="text-xs text-gold">Only {product.stock} left</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
