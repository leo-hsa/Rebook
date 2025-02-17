import {useState} from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
    return(
        <nav className="flex justify-between items-center bg-white shadow p-4 rounded-lg">
            <img src="/img/logo.png" alt="" />
        </nav>
    );
}

export default Header;