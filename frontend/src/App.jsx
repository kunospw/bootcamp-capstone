import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SignUp from "./pages/SignUp.jsx";
import SignIn from "./pages/SignIn.jsx";
import UserLandingPage from "./pages/user/LandingPage.jsx";
import CompanyLandingPage from "./pages/company/LandingPage.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/user/landing" element={<UserLandingPage />} />
        <Route path="/company/landing" element={<CompanyLandingPage />} />
        <Route path="/" element={<SignIn />} />
      </Routes>
    </Router>
  );
}