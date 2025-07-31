import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SignUp from "./pages/SignUp.jsx";
import SignIn from "./pages/SignIn.jsx";
import UserProfile from "./pages/user/Profile.jsx";
import CompanyProfile from "./pages/company/Profile.jsx";
import ProfileEdit from "./pages/company/ProfileEdit.jsx";
import JobList from "./pages/company/JobList.jsx";
import AddJob from "./pages/company/AddJob.jsx";
import EditJob from "./pages/company/EditJob.jsx";
import JobDetail from "./pages/company/JobDetail.jsx";
import Inbox from "./pages/company/Inbox.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/" element={<SignIn />} />
        <Route path="/company/profile" element={<CompanyProfile />} />
        <Route path="/company/profile/edit" element={<ProfileEdit />} />
        <Route path="/company/jobs" element={<JobList />} />
        <Route path="/company/jobs/add" element={<AddJob />} />
        <Route path="/company/jobs/:id/edit" element={<EditJob />} />
        <Route path="/company/jobs/:id" element={<JobDetail />} />
        <Route path="/company/applications" element={<Inbox />} />
        <Route path="/user/profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}