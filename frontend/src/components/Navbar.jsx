import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(search.trim() ? `/?search=${encodeURIComponent(search.trim())}` : "/");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur border-b border-line">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-6">
        <Link to="/" className="font-display text-2xl tracking-tight shrink-0">
          Market <span className="text-clay">&</span> Co.
        </Link>

        <form onSubmit={handleSearch} className="flex-1 hidden md:flex">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for anything…"
            className="w-full border border-line bg-white px-4 py-2 rounded-sm text-sm placeholder:text-ink/40 focus:border-moss-500 outline-none"
          />
        </form>

        <nav className="flex items-center gap-5 text-sm font-medium ml-auto">
          {user ? (
            <>
              <Link to="/orders" className="hover:text-moss-600 transition-colors">
                Orders
              </Link>
              <Link to="/cart" className="relative hover:text-moss-600 transition-colors">
                Cart
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-clay text-paper text-[10px] font-mono rounded-full w-4 h-4 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
              <span className="text-ink/50 hidden sm:inline">Hi, {user.name.split(" ")[0]}</span>
              <button onClick={handleLogout} className="btn-secondary !px-3 !py-1.5 text-xs">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-moss-600 transition-colors">
                Log in
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-2 text-xs">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
