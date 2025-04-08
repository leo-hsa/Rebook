import {useState} from "react";
import { useNavigate, Link } from "react-router-dom";


const Header = () => {
    return(
        <nav className="flex justify-between items-center bg-white shadow p-4  items-center sticky top-0  z-50 ">
            <div><Link to="/"><img src="/img/logo.png" alt="" /></Link></div>
            <div><ul className="flex justify-center justify-items-center space-x-4">
                <li><Link to="/">Shop</Link></li>
                <li><Link to="/genres">Genres</Link></li>
                <li><Link to="/authors">Authors</Link></li>
                <li><Link to="/info">About us</Link></li>

            </ul></div>

            <div>
                <ul className="flex justify-center justify-items-center space-x-4">
                <li><Link to="/"><img src="/img/search.png" alt="Search" /></Link></li>
                <li><Link to="/favorites"><img src="/img/heart.png" alt="Selected" /></Link></li>
                <li><Link to="/basket"><img src="/img/shop.png" alt="Basket" /></Link></li>
                <li><Link to="/profile"><img src="/img/account.png" alt="Profile" /></Link></li>
                </ul>
            </div>

            
        </nav>
    );
}

export default Header;