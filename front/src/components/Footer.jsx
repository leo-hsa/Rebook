import {useState} from "react";
import { useNavigate, Link } from "react-router-dom";

const Footer = () => {
    return (
        <div className="border-t-1 border-indigo-500 bg-white ">
            <div className="flex justify-between items-start p-4  items-center pt-12 mx-20">
                <div>
                <p className="text-3xl font-bold text-indigo-500">Rebook <br /> <span className="text-sm font-medium text-stone-950">Read more books</span></p>
               <p className="text-gray-600 pt-16">Satbayev university 1934<br />Almaty <br /> Kazakhstan
               </p>
                </div>

                <div>
                    <ul className="flex flex-col justify-center items-center justify-items-center ">
                        <li><p className="mb-4 pt-4 text-gray-600 font-bold">Links</p></li>
                        <li className="my-2"><Link to="/">Home</Link></li>
                        <li className="my-2"><Link to="/shop">Shop</Link></li>
                        
                        <li className="my-2"><Link to="/genres">Genres</Link></li>
                        <li className="my-2"><Link to="/authors">Authors</Link></li>
                    </ul>
                </div>
                <div>
                    <ul className="flex flex-col justify-center items-center justify-items-center ">
                        <li><p className="mb-4 pt-4 text-gray-600 font-bold">Help</p></li>
                        <li className="my-2"><Link to="/privacy">Privacy Policies</Link></li>
                        
                    </ul>
                </div>

               
            </div>
            <div className="mt-6 py-4 mx-20 border-t-1 border-indigo-500">
                <p>
                    2025 Rebook. All rights reserved
                </p>
            </div>
        </div>
    );
}

export default Footer;