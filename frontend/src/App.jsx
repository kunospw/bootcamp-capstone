import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SignUp from "./pages/SignUp.jsx";
import SignIn from "./pages/SignIn.jsx";
import UserProfile from "./pages/user/Profile.jsx";
import CompanyProfile from "./pages/company/Profile.jsx";
import ProfileEdit from "./pages/company/ProfileEdit.jsx";
import JobList from "./pages/company/JobList.jsx";
import AddJob from "./pages/company/AddJob.jsx";
import EditJob from "./pages/company/EditJob.jsx";
import CompanyJobDetail from "./pages/company/JobDetail.jsx";
import Applications from "./pages/company/Applications.jsx";
import ApplicantsDetail from "./pages/company/ApplicantsDetail.jsx";
import LandingPage from "./pages/user/LandingPage.jsx";
import UserJobDetail from "./pages/user/JobDetail.jsx";
import NavBar from "./Components/NavBar.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs" element={<LandingPage />} />
        <Route path="/job/:id" element={<UserJobDetail />} />
        <Route path="/company/profile" element={<CompanyProfile />} />
        <Route path="/company/profile/edit" element={<ProfileEdit />} />
        <Route path="/company/jobs" element={<JobList />} />
        <Route path="/company/jobs/add" element={<AddJob />} />
        <Route path="/company/jobs/edit/:jobId" element={<EditJob />} />
        <Route path="/company/jobs/:id" element={<CompanyJobDetail />} />
        <Route path="/company/applications" element={<Applications />} />
        <Route path="/company/applications/:applicationId" element={<ApplicantsDetail />} />
        <Route path="/user/profile" element={<UserProfile />} />
        <Route path="/navbar" element={<NavBar />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}