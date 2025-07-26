import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SignUp from "./pages/SignUp.jsx";
import SignIn from "./pages/SignIn.jsx";

export default function App() {
  return (
    <Router>
      <nav>
        <Link to="/signup">Sign Up</Link> | <Link to="/signin">Login</Link>
      </nav>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/" element={<SignIn />} />
      </Routes>
    </Router>
  );
}