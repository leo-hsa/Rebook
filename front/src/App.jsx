import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/InfoPage";
import PrivateRoute from "./components/PrivateRoute";
import PrivacyPolicies from "./pages/PrivacyPolicies";
import GenrePage from "./pages/GenrePage";
import AuthorPage from "./pages/AuthorPage"
import ShopPage from "./pages/ShopPage";
import ScrollToUp from "./components/ScrollToUp";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FavoritesPage from "./pages/FavoritesPage";
import Admin from "./pages/Admin";
import ProfilePage from "./pages/ProfilePage";


const Layout = ({ children }) => {
  const location = useLocation();
  const hideHeaderFooter = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      <ScrollToUp />
      {!hideHeaderFooter && <Header />}
      <main>{children}</main>
      {!hideHeaderFooter && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/info" element={<Home />} />
          <Route path="/privacy" element={<PrivacyPolicies />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/genres" element={<GenrePage />} />
          <Route path="/" element={<ShopPage />} />
          <Route path="/authors" element={<AuthorPage /> } />
          <Route element={<PrivateRoute />}>
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
