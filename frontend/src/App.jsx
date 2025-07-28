import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SignUp from "./pages/SignUp.jsx";
import SignIn from "./pages/SignIn.jsx";
import CompanyProfile from "./pages/company/Profile.jsx";
import JobList from "./pages/company/JobList.jsx";
import Inbox from "./pages/company/Inbox.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/" element={<SignIn />} />
        <Route path="/company/profile" element={<CompanyProfile />} />
        <Route path="/company/jobs" element={<JobList />} />
        <Route path="/company/applications" element={<Inbox />} />
      </Routes>
    </Router>
  );
}