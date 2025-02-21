import {useState} from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
const Home = () => {
    const [search, setSearch] = useState("");

    

    return (
        
        <div className="">
            <Header />
            <Footer />
        </div>
    )
}

export default Home;