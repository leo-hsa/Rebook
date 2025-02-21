import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import PrivateRoute from "./components/PrivateRoute";
import PrivacyPolicies from "./pages/PrivacyPolicies";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<PrivacyPolicies />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<h2>Профиль пользователя</h2>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
