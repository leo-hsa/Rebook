import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Determine the current page and redirect with query
    const currentPath = location.pathname;
    if (currentPath === "/") {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    } else if (currentPath === "/genres") {
      navigate(`/genres?search=${encodeURIComponent(searchQuery)}`);
    } else if (currentPath === "/authors") {
      navigate(`/authors?search=${encodeURIComponent(searchQuery)}`);
    }
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  return (
    <nav className="flex justify-between items-center bg-white shadow p-4 sticky top-0 z-50">
      <div>
        <Link to="/">
          <img src="/img/logo.png" alt="Logo" />
        </Link>
      </div>
      <div>
        <ul className="flex justify-center items-center space-x-4">
          <li><Link to="/">Shop</Link></li>
          <li><Link to="/genres">Genres</Link></li>
          <li><Link to="/authors">Authors</Link></li>
          <li><Link to="/info">About us</Link></li>
        </ul>
      </div>
      <div>
        <ul className="flex justify-center items-center space-x-4">
          <li><Link to="/favorites"><img src="/img/heart.png" alt="Favorites" /></Link></li>
          <li><Link to="/basket"><img src="/img/shop.png" alt="Basket" /></Link></li>
          <li><Link to="/profile"><img src="/img/account.png" alt="Profile" /></Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;